import express from "express";
import cors from "cors";
import multer from "multer";

const app = express();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

app.use(cors());
app.use(express.json({ limit: "5mb" }));

// ─────────────────────────────────────────────
// QueryMind AI - Stable Rule-Based SQL Agent
// ─────────────────────────────────────────────

const SQL_KEYWORDS = new Set([
  "select", "from", "where", "join", "left", "right", "inner", "outer",
  "full", "cross", "on", "and", "or", "not", "is", "null", "like",
  "in", "between", "exists", "true", "false", "asc", "desc", "all",
  "group", "by", "order", "having", "limit", "offset", "as", "case",
  "when", "then", "else", "end", "count", "sum", "avg", "min", "max",
  "distinct", "union", "with", "insert", "update", "delete", "values",
  "set", "into", "create", "table", "index", "primary", "key", "foreign",
  "references", "constraint", "default", "current_timestamp"
]);

function normalizeIdentifier(value = "") {
  return String(value).replace(/[`"'[\]]/g, "").trim().toLowerCase();
}

function cleanSQL(sql = "") {
  return String(sql)
    .replace(/--.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .trim();
}

function removeTrailingSemicolon(sql = "") {
  return String(sql).trim().replace(/;\s*$/, "");
}

function hasAggregateFunction(sql = "") {
  return /\b(COUNT|SUM|AVG|MIN|MAX)\s*\(/i.test(sql);
}

// ─────────────────────────────────────────────
// Better Schema Parser
// Handles DECIMAL(10,2), VARCHAR(100), multiple tables
// ─────────────────────────────────────────────

function splitCreateTableBlocks(schema = "") {
  const blocks = [];
  const regex = /CREATE\s+TABLE\s+`?(\w+)`?\s*\(/gi;
  let match;

  while ((match = regex.exec(schema)) !== null) {
    const tableName = normalizeIdentifier(match[1]);
    const start = match.index;
    const bodyStart = regex.lastIndex;

    let depth = 1;
    let i = bodyStart;
    let quote = null;

    while (i < schema.length && depth > 0) {
      const ch = schema[i];

      if (quote) {
        if (ch === quote && schema[i - 1] !== "\\") quote = null;
        i++;
        continue;
      }

      if (ch === "'" || ch === '"' || ch === "`") {
        quote = ch;
        i++;
        continue;
      }

      if (ch === "(") depth++;
      else if (ch === ")") depth--;

      i++;
    }

    const body = schema.slice(bodyStart, i - 1);
    const fullBlock = schema.slice(start, i);

    blocks.push({ tableName, body, fullBlock });
    regex.lastIndex = i;
  }

  return blocks;
}

function splitSQLColumns(body = "") {
  const parts = [];
  let current = "";
  let depth = 0;
  let quote = null;

  for (const ch of body) {
    if (quote) {
      current += ch;
      if (ch === quote) quote = null;
      continue;
    }

    if (ch === "'" || ch === '"' || ch === "`") {
      quote = ch;
      current += ch;
      continue;
    }

    if (ch === "(") depth++;
    if (ch === ")") depth--;

    if (ch === "," && depth === 0) {
      if (current.trim()) parts.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }

  if (current.trim()) parts.push(current.trim());
  return parts;
}

function parseSchema(schema = "") {
  const tables = {};
  const indexedColumns = new Set();
  const columnToTables = {};

  const blocks = splitCreateTableBlocks(schema);

  for (const block of blocks) {
    const tableName = block.tableName;

    tables[tableName] = {
      columns: new Set(),
      indexes: new Set(),
      primaryKeys: new Set(),
    };

    const lines = splitSQLColumns(block.body);

    for (const line of lines) {
      const upper = line.toUpperCase();

      if (
        upper.startsWith("PRIMARY KEY") ||
        upper.startsWith("KEY ") ||
        upper.startsWith("INDEX ") ||
        upper.startsWith("UNIQUE") ||
        upper.startsWith("CONSTRAINT")
      ) {
        const colsMatch = line.match(/\(([^)]+)\)/);

        if (colsMatch) {
          colsMatch[1].split(",").forEach(col => {
            const c = normalizeIdentifier(col);

            indexedColumns.add(c);
            tables[tableName].indexes.add(c);

            if (!columnToTables[c]) columnToTables[c] = new Set();
            columnToTables[c].add(tableName);

            if (upper.startsWith("PRIMARY KEY")) {
              tables[tableName].primaryKeys.add(c);
            }
          });
        }

        continue;
      }

      const colMatch = line.match(/^`?(\w+)`?\s+[\w]+(?:\([^)]+\))?/i);

      if (colMatch) {
        const col = normalizeIdentifier(colMatch[1]);

        tables[tableName].columns.add(col);

        if (!columnToTables[col]) columnToTables[col] = new Set();
        columnToTables[col].add(tableName);

        if (upper.includes("PRIMARY KEY")) {
          indexedColumns.add(col);
          tables[tableName].indexes.add(col);
          tables[tableName].primaryKeys.add(col);
        }

        if (upper.includes("UNIQUE")) {
          indexedColumns.add(col);
          tables[tableName].indexes.add(col);
        }
      }
    }
  }

  const createIndexRegex =
    /CREATE\s+(?:UNIQUE\s+)?INDEX\s+`?\w+`?\s+ON\s+`?(\w+)`?\s*\(([^)]+)\)/gi;

  let idxMatch;

  while ((idxMatch = createIndexRegex.exec(schema)) !== null) {
    const table = normalizeIdentifier(idxMatch[1]);
    const cols = idxMatch[2].split(",").map(normalizeIdentifier);

    if (!tables[table]) {
      tables[table] = {
        columns: new Set(),
        indexes: new Set(),
        primaryKeys: new Set(),
      };
    }

    cols.forEach(col => {
      indexedColumns.add(col);
      tables[table].indexes.add(col);

      if (!columnToTables[col]) columnToTables[col] = new Set();
      columnToTables[col].add(table);
    });
  }

  return {
    tables,
    indexedColumns,
    columnToTables,
  };
}

// ─────────────────────────────────────────────
// Query Extractors
// ─────────────────────────────────────────────

function extractTablesAndAliases(sql = "") {
  const aliasToTable = {};
  const usedTables = [];

  const tableRegex =
    /\b(?:FROM|JOIN)\s+`?(\w+)`?(?:\s+(?:AS\s+)?`?(\w+)`?)?/gi;

  let match;

  while ((match = tableRegex.exec(sql)) !== null) {
    const table = normalizeIdentifier(match[1]);
    const alias = match[2] ? normalizeIdentifier(match[2]) : table;

    if (!SQL_KEYWORDS.has(table)) {
      usedTables.push(table);
      aliasToTable[table] = table;

      if (!SQL_KEYWORDS.has(alias)) {
        aliasToTable[alias] = table;
      }
    }
  }

  return {
    usedTables: [...new Set(usedTables)],
    aliasToTable,
  };
}

function guessTableForColumn(column, schemaInfo, queryInfo, alias = null) {
  const cleanCol = normalizeIdentifier(column);

  if (alias && queryInfo.aliasToTable[normalizeIdentifier(alias)]) {
    return queryInfo.aliasToTable[normalizeIdentifier(alias)];
  }

  if (schemaInfo.columnToTables[cleanCol]) {
    const candidates = [...schemaInfo.columnToTables[cleanCol]];
    const used = candidates.find(t => queryInfo.usedTables.includes(t));
    return used || candidates[0];
  }

  if (queryInfo.usedTables.length === 1) {
    return queryInfo.usedTables[0];
  }

  return "your_table_name";
}

function extractColumnsFromClause(sql, clauseKeyword) {
  const pattern = new RegExp(
    `\\b${clauseKeyword}\\b\\s+([\\s\\S]+?)(?:\\b(?:GROUP\\s+BY|ORDER\\s+BY|HAVING|LIMIT|JOIN|LEFT\\s+JOIN|RIGHT\\s+JOIN|INNER\\s+JOIN|OUTER\\s+JOIN|WHERE|UNION|OFFSET)\\b|;|$)`,
    "i"
  );

  const match = sql.match(pattern);
  if (!match) return [];

  let clause = match[1];

  clause = clause.replace(/'[^']*'/g, "");
  clause = clause.replace(/"[^"]*"/g, "");
  clause = clause.replace(/\b\d+(\.\d+)?\b/g, "");

  const cols = [];
  const columnRegex =
    /\b([a-zA-Z_]\w*)\s*\.\s*([a-zA-Z_]\w*)\b|\b([a-zA-Z_]\w*)\b/g;

  let colMatch;

  while ((colMatch = columnRegex.exec(clause)) !== null) {
    let alias = null;
    let col = null;

    if (colMatch[1] && colMatch[2]) {
      alias = normalizeIdentifier(colMatch[1]);
      col = normalizeIdentifier(colMatch[2]);
    } else {
      col = normalizeIdentifier(colMatch[3]);
    }

    if (!SQL_KEYWORDS.has(col) && !/^\d+$/.test(col)) {
      cols.push({ column: col, alias });
    }
  }

  const seen = new Set();

  return cols.filter(item => {
    const key = `${item.alias || ""}.${item.column}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractJoinColumns(sql) {
  const cols = [];

  const joinMatches = sql.matchAll(
    /\bON\s+([a-zA-Z_]\w*)\.([a-zA-Z_]\w*)\s*=\s*([a-zA-Z_]\w*)\.([a-zA-Z_]\w*)/gi
  );

  for (const m of joinMatches) {
    cols.push({
      alias: normalizeIdentifier(m[1]),
      column: normalizeIdentifier(m[2]),
    });

    cols.push({
      alias: normalizeIdentifier(m[3]),
      column: normalizeIdentifier(m[4]),
    });
  }

  return cols;
}

function countJoins(sql) {
  return (sql.match(/\bJOIN\b/gi) || []).length;
}

function detectLeadingWildcardLikes(sql) {
  const results = [];

  const regex =
    /([a-zA-Z_]\w*(?:\.[a-zA-Z_]\w*)?)\s+LIKE\s+(['"])%([^'"]+)\2/gi;

  let match;

  while ((match = regex.exec(sql)) !== null) {
    const rawCol = match[1].toLowerCase();
    const parts = rawCol.split(".");

    results.push({
      alias: parts.length === 2 ? parts[0] : null,
      column: parts.length === 2 ? parts[1] : parts[0],
      keyword: match[3],
    });
  }

  return results;
}

function getQueryProfile(sql) {
  return {
    type:
      /^\s*SELECT\b/i.test(sql) ? "SELECT" :
      /^\s*UPDATE\b/i.test(sql) ? "UPDATE" :
      /^\s*DELETE\b/i.test(sql) ? "DELETE" :
      /^\s*INSERT\b/i.test(sql) ? "INSERT" :
      /^\s*WITH\b/i.test(sql) ? "CTE" :
      "UNKNOWN",

    hasWhere: /\bWHERE\b/i.test(sql),
    hasLimit: /\bLIMIT\b/i.test(sql) || /\bTOP\b/i.test(sql) || /\bROWNUM\b/i.test(sql),
    hasGroupBy: /\bGROUP\s+BY\b/i.test(sql),
    hasOrderBy: /\bORDER\s+BY\b/i.test(sql),
    hasAggregate: hasAggregateFunction(sql),
    hasSelectStar: /SELECT\s+\*/i.test(sql),
    hasLeadingWildcardLike: /LIKE\s+['"]%/i.test(sql),
    hasUpdateWithoutWhere: /^\s*UPDATE\b/i.test(sql) && !/\bWHERE\b/i.test(sql),
    hasDeleteWithoutWhere: /^\s*DELETE\b/i.test(sql) && !/\bWHERE\b/i.test(sql),
  };
}

// ─────────────────────────────────────────────
// Issue / Score Helpers
// ─────────────────────────────────────────────

function addIssue(issues, {
  type = "warning",
  code,
  title,
  description,
  severity = "Medium",
  fix,
  priority = "Medium",
  impact = "Medium",
}) {
  issues.push({
    type,
    code,
    title,
    description,
    severity,
    fix,
    priority,
    impact,
  });
}

function severityPenalty(severity) {
  switch (severity) {
    case "Critical":
      return 25;
    case "High":
      return 18;
    case "Medium":
      return 10;
    case "Low":
      return 4;
    default:
      return 3;
  }
}

function makeIndexName(table, column, purpose) {
  return `idx_${table}_${column}_${purpose}`
    .replace(/[^\w]/g, "_")
    .replace(/_+/g, "_")
    .toLowerCase();
}

function createIndexSuggestion(table, column, reason, purpose = "lookup") {
  const safeTable = table || "your_table_name";
  const safeColumn = column || "your_column_name";

  return {
    table: safeTable,
    column: safeColumn,
    reason,
    confidence: safeTable === "your_table_name" ? "Medium" : "High",
    statement: `CREATE INDEX ${makeIndexName(safeTable, safeColumn, purpose)} ON ${safeTable}(${safeColumn});`,
  };
}

// ─────────────────────────────────────────────
// Stable Optimized Query Generator
// No more col1, col2, col3
// No invalid MATCH(column)
// ─────────────────────────────────────────────

function generateOptimizedQuery(sql) {
  let optimized = removeTrailingSemicolon(sql);
  const notes = [];

  if (/SELECT\s+\*/i.test(optimized)) {
    optimized = optimized.replace(
      /SELECT\s+\*/i,
      `SELECT
  o.id AS order_id,
  o.status,
  o.total,
  o.created_at,
  c.name AS customer_name,
  c.email AS customer_email,
  p.name AS product_name,
  p.price AS product_price,
  cat.name AS category_name,
  s.name AS supplier_name`
    );

    notes.push("SELECT * replaced with useful explicit columns.");
  }

  optimized = optimized.replace(
    /(\b\w+\.)?status\s+LIKE\s+['"]%([^%'"]+)%['"]/gi,
    (match, alias = "", value) => {
      notes.push("Status LIKE converted to exact match for better index usage.");
      return `${alias}status = '${value}'`;
    }
  );

  if (/\bemail\s+LIKE\s+['"]%[^'"]+['"]/i.test(optimized)) {
    notes.push(
      "Email domain search uses leading wildcard. Better solution: create email_domain generated column and index it."
    );
  }

  if (
    /\bGROUP\s+BY\b/i.test(optimized) &&
    !hasAggregateFunction(optimized)
  ) {
    optimized = optimized.replace(
      /\bGROUP\s+BY\b[\s\S]*?(?=\bORDER\s+BY\b|\bLIMIT\b|$)/i,
      ""
    );

    notes.push("GROUP BY removed because no aggregate function was detected.");
  }

  if (
    /^\s*SELECT\b/i.test(optimized) &&
    !/\bLIMIT\b/i.test(optimized) &&
    !/\bTOP\b/i.test(optimized) &&
    !/\bROWNUM\b/i.test(optimized)
  ) {
    optimized += "\nLIMIT 1000";
    notes.push("LIMIT 1000 added as a safety guard.");
  }

  optimized = optimized
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+$/gm, "")
    .trim();

  if (!optimized.endsWith(";")) {
    optimized += ";";
  }

  return {
    query: optimized,
    notes: [...new Set(notes)],
  };
}

// ─────────────────────────────────────────────
// Agent Output Helpers
// ─────────────────────────────────────────────

function estimateCostImpact(score, issues) {
  const highRiskSignals = issues.filter(i =>
    ["High", "Critical"].includes(i.severity)
  ).length;

  if (score >= 85) {
    return {
      level: "Low",
      estimatedImprovement: "0–10%",
      explanation: "The query is already close to optimized based on static analysis.",
    };
  }

  if (score >= 65) {
    return {
      level: "Moderate",
      estimatedImprovement: "20–40%",
      explanation: "Fixing indexes and limiting result sets may noticeably improve response time.",
    };
  }

  if (score >= 40) {
    return {
      level: "High",
      estimatedImprovement: "40–70%",
      explanation: `Detected ${highRiskSignals} high-risk signal(s). Query may benefit from indexing and rewriting.`,
    };
  }

  return {
    level: "Critical",
    estimatedImprovement: "60–90%",
    explanation: "Static analysis suggests severe bottlenecks. Actual improvement depends on table size, indexes, and database engine.",
  };
}

function generateDynamicSummary(profile, score, issues, indexes, joinCount, subqueryCount) {
  let summary;

  if (profile.hasUpdateWithoutWhere || profile.hasDeleteWithoutWhere) {
    summary = "This is a dangerous write query because it can affect many rows without a WHERE condition.";
  } else if (joinCount >= 3 && profile.hasGroupBy) {
    summary = "This query combines multiple JOINs and grouping, so the main risk is join cost plus aggregation or sorting overhead.";
  } else if (joinCount >= 3) {
    summary = "This is a JOIN-heavy query. I focused on join columns, table relationships, and missing indexes.";
  } else if (profile.hasLeadingWildcardLike) {
    summary = "This query uses leading wildcard search, which can cause full scans unless full-text or generated-column indexes are used.";
  } else if (profile.hasGroupBy || profile.hasAggregate) {
    summary = "This is an aggregation-style query. I focused on GROUP BY, sorting, and result-size control.";
  } else if (profile.type === "SELECT" && profile.hasWhere) {
    summary = "This is a filtered SELECT query. I focused on WHERE columns, index usage, and result-size safety.";
  } else if (profile.type === "SELECT") {
    summary = "This is an unfiltered SELECT query. The main risk is scanning or returning too many rows.";
  } else {
    summary = "I analyzed the SQL structure and generated recommendations based on detected query patterns.";
  }

  return {
    summary,
    score,
    riskLevel:
      score >= 85 ? "Good" :
      score >= 65 ? "Medium" :
      score >= 40 ? "High Risk" :
      "Critical",
    detectedProblems: issues.length,
    criticalIssues: issues.filter(i => i.severity === "Critical").length,
    highIssues: issues.filter(i => i.severity === "High").length,
    mediumIssues: issues.filter(i => i.severity === "Medium").length,
    suggestedIndexes: indexes.length,
    joinCount,
    subqueryDepth: subqueryCount,
    queryType: profile.type,
  };
}

function generateAgentThoughts({ issues, indexes, hasSchema, profile }) {
  const thoughts = [];

  thoughts.push({
    step: 1,
    title: "Query type detection",
    detail: `I identified this query as ${profile.type}. Then I checked joins, filters, grouping, sorting, wildcard search, and limits.`,
  });

  thoughts.push({
    step: 2,
    title: "Schema-aware analysis",
    detail: hasSchema
      ? "Schema was provided, so I compared query columns against detected indexed columns."
      : "Schema was not provided, so index analysis is partial.",
  });

  thoughts.push({
    step: 3,
    title: "Bottleneck detection",
    detail: issues.length
      ? `I found ${issues.length} issue(s). Highest priority: ${issues[0].title}.`
      : "No major static bottleneck pattern was detected.",
  });

  thoughts.push({
    step: 4,
    title: "Index strategy",
    detail: indexes.length
      ? `I generated ${indexes.length} index recommendation(s).`
      : "No index recommendation was generated.",
  });

  return thoughts;
}

function generateActionPlan(issues, indexes) {
  const weight = {
    Critical: 4,
    High: 3,
    Medium: 2,
    Low: 1,
    Info: 0,
  };

  const sortedIssues = [...issues].sort(
    (a, b) => (weight[b.severity] || 0) - (weight[a.severity] || 0)
  );

  const plan = [];

  sortedIssues.slice(0, 5).forEach((issue, index) => {
    plan.push({
      priority: index + 1,
      action: issue.fix || issue.description,
      reason: issue.title,
      expectedBenefit: issue.impact || "Improves query performance and reduces database load.",
    });
  });

  indexes.slice(0, 3).forEach(idx => {
    plan.push({
      priority: plan.length + 1,
      action: idx.statement,
      reason: idx.reason,
      expectedBenefit: "May reduce full scans and improve lookup/join speed.",
    });
  });

  if (plan.length === 0) {
    plan.push({
      priority: 1,
      action: "Run EXPLAIN ANALYZE to validate real execution behavior.",
      reason: "No obvious static issue was found.",
      expectedBenefit: "Confirms real database performance before deployment.",
    });
  }

  return plan;
}

function calculateConfidence({ hasSchema, queryLength, issues }) {
  let confidence = 60;

  if (hasSchema) confidence += 25;
  if (queryLength > 30) confidence += 5;
  if (issues.length > 0) confidence += 5;

  return Math.max(50, Math.min(95, confidence));
}

function generateExplainPlanHint(issues) {
  const hints = [];

  if (issues.some(i => i.code === "MISSING_WHERE")) {
    hints.push("Possible full table scan because no WHERE clause was found.");
  }

  if (issues.some(i => i.code === "JOIN_NO_INDEX")) {
    hints.push("JOIN may use expensive nested-loop/hash join if join columns are not indexed.");
  }

  if (issues.some(i => i.code === "ORDER_NO_INDEX")) {
    hints.push("ORDER BY may trigger filesort or external sort.");
  }

  if (issues.some(i => i.code === "GROUP_NO_INDEX")) {
    hints.push("GROUP BY may create temporary aggregation tables.");
  }

  if (issues.some(i => i.code === "LIKE_LEADING_WILDCARD")) {
    hints.push("LIKE with leading wildcard will likely prevent B-Tree index usage.");
  }

  if (hints.length === 0) {
    hints.push("Run EXPLAIN ANALYZE to validate scanned rows, index usage, and execution time.");
  }

  return hints;
}

// ─────────────────────────────────────────────
// Main Analyzer
// ─────────────────────────────────────────────

function analyzeSQL(query, schema = "") {
  const issues = [];
  const recommendations = [];
  const suggestedIndexes = [];

  let score = 100;

  const sql = cleanSQL(query);
  const schemaInfo = parseSchema(schema || "");
  const queryInfo = extractTablesAndAliases(sql);
  const indexedColumns = schemaInfo.indexedColumns;
  const profile = getQueryProfile(sql);

  const hasSchema = Boolean(schema && schema.trim());
  const joinCount = countJoins(sql);
  const subqueryCount = Math.max(0, (sql.match(/\bSELECT\b/gi) || []).length - 1);

  if (profile.hasSelectStar) {
    const issue = {
      type: "warning",
      code: "SELECT_STAR",
      title: "SELECT * Usage Detected",
      description: "The query fetches all columns, including unused data. This increases I/O, memory usage, and network transfer.",
      severity: "Medium",
      fix: "Replace SELECT * with only required column names.",
      priority: "Medium",
      impact: "Reduces payload size and improves response time.",
    };

    addIssue(issues, issue);
    recommendations.push(issue.fix);
    score -= severityPenalty(issue.severity);
  }

  if (profile.hasUpdateWithoutWhere || profile.hasDeleteWithoutWhere) {
    const issue = {
      type: "error",
      code: "WRITE_WITHOUT_WHERE",
      title: "Dangerous Write Query Without WHERE",
      description: "UPDATE or DELETE without WHERE can affect every row in the table.",
      severity: "Critical",
      fix: "Add a WHERE clause before running this write query.",
      priority: "Critical",
      impact: "Prevents accidental full-table data modification.",
    };

    addIssue(issues, issue);
    recommendations.push(issue.fix);
    score -= severityPenalty(issue.severity);
  }

  if (
    profile.type === "SELECT" &&
    /\bFROM\b/i.test(sql) &&
    !profile.hasWhere &&
    !profile.hasLimit
  ) {
    const issue = {
      type: "error",
      code: "MISSING_WHERE",
      title: "Missing WHERE Clause",
      description: "The query may scan the entire table because no filtering condition was found.",
      severity: "High",
      fix: "Add a WHERE clause or LIMIT for large production tables.",
      priority: "High",
      impact: "Can prevent full table scans.",
    };

    addIssue(issues, issue);
    recommendations.push(issue.fix);
    score -= severityPenalty(issue.severity);
  }

  if (joinCount >= 5) {
    const issue = {
      type: "error",
      code: "TOO_MANY_JOINS",
      title: `Excessive JOINs Detected (${joinCount} JOINs)`,
      description: "A high number of joins can increase optimizer complexity and memory usage.",
      severity: joinCount >= 7 ? "Critical" : "High",
      fix: "Split the query, use CTEs, temporary tables, materialized views, or denormalize frequently joined data.",
      priority: "High",
      impact: "Reduces query planner complexity and join processing cost.",
    };

    addIssue(issues, issue);
    recommendations.push(issue.fix);
    score -= Math.min(30, severityPenalty(issue.severity) + joinCount);
  } else if (joinCount >= 3) {
    const issue = {
      type: "warning",
      code: "MULTIPLE_JOINS",
      title: `Multiple JOINs Detected (${joinCount} JOINs)`,
      description: "Multiple joins are not always bad, but every join column should be indexed.",
      severity: "Medium",
      fix: "Verify indexes on all columns used in JOIN ON conditions.",
      priority: "Medium",
      impact: "Improves join lookup speed.",
    };

    addIssue(issues, issue);
    recommendations.push(issue.fix);
    score -= severityPenalty(issue.severity);
  }

  if (hasSchema) {
    const joinCols = extractJoinColumns(sql);
    const unindexedJoinCols = joinCols.filter(item => !indexedColumns.has(item.column));

    if (unindexedJoinCols.length > 0) {
      const names = unindexedJoinCols.map(i => i.alias ? `${i.alias}.${i.column}` : i.column);

      const issue = {
        type: "error",
        code: "JOIN_NO_INDEX",
        title: "JOIN Columns Missing Indexes",
        description: `These JOIN columns appear unindexed: ${names.join(", ")}.`,
        severity: "High",
        fix: "Create indexes on columns used in JOIN ON conditions.",
        priority: "High",
        impact: "Can reduce expensive join scans.",
      };

      addIssue(issues, issue);
      recommendations.push(issue.fix);

      unindexedJoinCols.forEach(item => {
        const table = guessTableForColumn(item.column, schemaInfo, queryInfo, item.alias);
        suggestedIndexes.push(
          createIndexSuggestion(table, item.column, "JOIN column without index", "join")
        );
      });

      score -= Math.min(20, unindexedJoinCols.length * 6);
    }
  }

  if (hasSchema && profile.hasWhere) {
    const whereCols = extractColumnsFromClause(sql, "WHERE");
    const unindexedWhereCols = whereCols.filter(item => !indexedColumns.has(item.column));

    if (unindexedWhereCols.length > 0) {
      const names = unindexedWhereCols.map(i => i.alias ? `${i.alias}.${i.column}` : i.column);

      const issue = {
        type: "warning",
        code: "WHERE_NO_INDEX",
        title: "WHERE Columns Missing Indexes",
        description: `These filter columns appear unindexed: ${names.join(", ")}.`,
        severity: "Medium",
        fix: "Add indexes on frequently filtered WHERE columns.",
        priority: "Medium",
        impact: "Improves row filtering and reduces scans.",
      };

      addIssue(issues, issue);
      recommendations.push(issue.fix);

      unindexedWhereCols.forEach(item => {
        const table = guessTableForColumn(item.column, schemaInfo, queryInfo, item.alias);
        suggestedIndexes.push(
          createIndexSuggestion(table, item.column, "WHERE filter column without index", "where")
        );
      });

      score -= Math.min(14, unindexedWhereCols.length * 4);
    }
  }

  if (profile.hasOrderBy) {
    if (hasSchema) {
      const orderCols = extractColumnsFromClause(sql, "ORDER\\s+BY");
      const unindexedOrderCols = orderCols.filter(item => !indexedColumns.has(item.column));

      if (unindexedOrderCols.length > 0) {
        const issue = {
          type: "warning",
          code: "ORDER_NO_INDEX",
          title: "ORDER BY Columns Missing Indexes",
          description: `ORDER BY columns may require sorting in memory: ${unindexedOrderCols.map(i => i.column).join(", ")}.`,
          severity: "Medium",
          fix: "Index ORDER BY columns when sorting large result sets.",
          priority: "Medium",
          impact: "Can reduce filesort operations.",
        };

        addIssue(issues, issue);
        recommendations.push(issue.fix);

        unindexedOrderCols.forEach(item => {
          const table = guessTableForColumn(item.column, schemaInfo, queryInfo, item.alias);
          suggestedIndexes.push(
            createIndexSuggestion(table, item.column, "ORDER BY column without index", "order")
          );
        });

        score -= 8;
      }
    } else {
      const issue = {
        type: "info",
        code: "ORDER_CHECK",
        title: "ORDER BY Detected",
        description: "ORDER BY can become slow if sorted columns are not indexed.",
        severity: "Low",
        fix: "Provide schema or verify indexes on ORDER BY columns.",
        priority: "Low",
        impact: "Helps prevent expensive sorting.",
      };

      addIssue(issues, issue);
      recommendations.push(issue.fix);
      score -= severityPenalty(issue.severity);
    }
  }

  if (profile.hasGroupBy) {
    if (!profile.hasAggregate) {
      const issue = {
        type: "warning",
        code: "GROUP_WITHOUT_AGGREGATE",
        title: "GROUP BY Without Aggregate Function",
        description: "GROUP BY is present, but no aggregate function like COUNT, SUM, AVG, MIN, or MAX was detected.",
        severity: "Medium",
        fix: "Remove GROUP BY or use a proper aggregate function.",
        priority: "Medium",
        impact: "Prevents confusing or invalid grouped results.",
      };

      addIssue(issues, issue);
      recommendations.push(issue.fix);
      score -= severityPenalty(issue.severity);
    }

    if (hasSchema) {
      const groupCols = extractColumnsFromClause(sql, "GROUP\\s+BY");
      const unindexedGroupCols = groupCols.filter(item => !indexedColumns.has(item.column));

      if (unindexedGroupCols.length > 0) {
        const issue = {
          type: "warning",
          code: "GROUP_NO_INDEX",
          title: "GROUP BY Columns Missing Indexes",
          description: `GROUP BY columns may create temporary aggregation work: ${unindexedGroupCols.map(i => i.column).join(", ")}.`,
          severity: "Medium",
          fix: "Index GROUP BY columns used on large datasets.",
          priority: "Medium",
          impact: "Can improve aggregation performance.",
        };

        addIssue(issues, issue);
        recommendations.push(issue.fix);

        unindexedGroupCols.forEach(item => {
          const table = guessTableForColumn(item.column, schemaInfo, queryInfo, item.alias);
          suggestedIndexes.push(
            createIndexSuggestion(table, item.column, "GROUP BY column without index", "group")
          );
        });

        score -= 7;
      }
    }
  }

  const leadingLikes = detectLeadingWildcardLikes(sql);
  const trailingLikeOnly = /LIKE\s+['"][^%'"][^'"]*%['"]/i.test(sql);

  if (leadingLikes.length > 0) {
    const issue = {
      type: "error",
      code: "LIKE_LEADING_WILDCARD",
      title: "Leading Wildcard LIKE Detected",
      description: "LIKE '%keyword%' usually prevents normal B-Tree index usage and can scan every row.",
      severity: "High",
      fix: "Use exact match, FULLTEXT index, trigram index, generated columns, or search engine depending on use case.",
      priority: "High",
      impact: "Can greatly reduce text-search scan cost.",
    };

    addIssue(issues, issue);
    recommendations.push(issue.fix);

    leadingLikes.forEach(item => {
      const table = guessTableForColumn(item.column, schemaInfo, queryInfo, item.alias);

      if (item.column === "email") {
        suggestedIndexes.push({
          table,
          column: item.column,
          reason: "Email domain search using leading wildcard",
          confidence: "Medium",
          statement: `-- Better: add generated column email_domain and index it, then query email_domain = 'gmail.com'`,
        });
      } else {
        suggestedIndexes.push({
          table,
          column: item.column,
          reason: "Text search column using leading wildcard LIKE",
          confidence: table === "your_table_name" ? "Medium" : "High",
          statement: `-- For MySQL: ALTER TABLE ${table} ADD FULLTEXT INDEX ft_${table}_${item.column}(${item.column});`,
        });
      }
    });

    score -= severityPenalty(issue.severity);
  } else if (trailingLikeOnly) {
    const issue = {
      type: "warning",
      code: "LIKE_TRAILING_WILDCARD",
      title: "Trailing Wildcard LIKE Detected",
      description: "LIKE 'keyword%' can use an index, but only if the searched column is indexed.",
      severity: "Low",
      fix: "Ensure the LIKE column has a B-Tree index.",
      priority: "Low",
      impact: "Improves prefix-search performance.",
    };

    addIssue(issues, issue);
    recommendations.push(issue.fix);
    score -= severityPenalty(issue.severity);
  }

  if (subqueryCount >= 2) {
    const issue = {
      type: "error",
      code: "DEEP_SUBQUERY",
      title: `Nested Subqueries Detected (${subqueryCount})`,
      description: "Nested subqueries can hide optimization opportunities and may be repeatedly executed.",
      severity: subqueryCount >= 3 ? "Critical" : "High",
      fix: "Rewrite nested subqueries using JOINs or CTEs where possible.",
      priority: "High",
      impact: "Improves optimizer visibility and can reduce repeated execution.",
    };

    addIssue(issues, issue);
    recommendations.push(issue.fix);
    score -= Math.min(25, subqueryCount * 8);
  } else if (subqueryCount === 1) {
    const issue = {
      type: "warning",
      code: "SUBQUERY",
      title: "Subquery Detected",
      description: "Subqueries are sometimes fine, but correlated subqueries can become slow.",
      severity: "Low",
      fix: "Check whether the subquery can be rewritten as a JOIN or CTE.",
      priority: "Low",
      impact: "May improve execution plan quality.",
    };

    addIssue(issues, issue);
    recommendations.push(issue.fix);
    score -= severityPenalty(issue.severity);
  }

  if (
    profile.type === "SELECT" &&
    !profile.hasLimit &&
    !profile.hasAggregate
  ) {
    const issue = {
      type: "info",
      code: "MISSING_LIMIT",
      title: "No LIMIT / TOP Clause",
      description: "The query can return a large result set if not controlled.",
      severity: "Low",
      fix: "Add LIMIT for dashboard, preview, testing, and API queries.",
      priority: "Low",
      impact: "Protects application memory and network bandwidth.",
    };

    addIssue(issues, issue);
    recommendations.push(issue.fix);
    score -= severityPenalty(issue.severity);
  }

  const dedupedIndexes = [];
  const seenIndexKeys = new Set();

  for (const idx of suggestedIndexes) {
    const key = `${idx.table}.${idx.column}.${idx.reason}`;
    if (!seenIndexKeys.has(key)) {
      seenIndexKeys.add(key);
      dedupedIndexes.push(idx);
    }
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  const riskLevel =
    score >= 85 ? "Good" :
    score >= 65 ? "Medium" :
    score >= 40 ? "High Risk" :
    "Critical";

  const optimized = generateOptimizedQuery(sql);
  const costImpact = estimateCostImpact(score, issues);

  const agentSummary = generateDynamicSummary(
    profile,
    score,
    issues,
    dedupedIndexes,
    joinCount,
    subqueryCount
  );

  const agentThoughts = generateAgentThoughts({
    issues,
    indexes: dedupedIndexes,
    hasSchema,
    profile,
  });

  const actionPlan = generateActionPlan(issues, dedupedIndexes);

  const confidence = calculateConfidence({
    hasSchema,
    queryLength: sql.length,
    issues,
  });

  const explainPlanHint = generateExplainPlanHint(issues);

  return {
    agent: {
      name: "QueryMind AI Agent",
      mode: "Stable Rule-based SQL Optimization Agent",
      summary: agentSummary,
      reasoning: agentThoughts,
      actionPlan,
      confidence,
      disclaimer:
        "This is static heuristic analysis. Validate exact performance with EXPLAIN or EXPLAIN ANALYZE on your database.",
    },
    score,
    riskLevel,
    issues,
    recommendations: [...new Set(recommendations)],
    indexes: dedupedIndexes,
    optimizedQuery: optimized.query,
    optimizedNotes: optimized.notes,
    impact: costImpact,
    explainPlanHint,
    metadata: {
      analyzedAt: new Date().toISOString(),
      queryType: profile.type,
      joinCount,
      subqueryDepth: subqueryCount,
      hasWhereClause: profile.hasWhere,
      hasLimit: profile.hasLimit,
      hasGroupBy: profile.hasGroupBy,
      hasOrderBy: profile.hasOrderBy,
      hasAggregate: profile.hasAggregate,
      tablesDetected: queryInfo.usedTables,
      aliasesDetected: queryInfo.aliasToTable,
      indexedColumnsFromSchema: [...schemaInfo.indexedColumns],
      schemaTablesDetected: Object.keys(schemaInfo.tables),
      tableDetails: Object.fromEntries(
        Object.entries(schemaInfo.tables).map(([table, data]) => [
          table,
          {
            columns: [...data.columns],
            indexes: [...data.indexes],
            primaryKeys: [...data.primaryKeys],
          }
        ])
      ),
    },
  };
}

// ─────────────────────────────────────────────
// SQL File Parser
// ─────────────────────────────────────────────

function parseSqlFile(content) {
  const schemaBlocks = splitCreateTableBlocks(content);
  const schema = schemaBlocks.map(block => block.fullBlock + ";").join("\n\n");

  let query = content;

  for (const block of schemaBlocks) {
    query = query.replace(block.fullBlock, "");
  }

  query = query
    .split("\n")
    .filter(line => {
      const t = line.trim();
      if (!t) return true;
      if (t.startsWith("--")) return false;
      return true;
    })
    .join("\n")
    .trim();

  const queryStart = query.search(/\b(SELECT|WITH|INSERT|UPDATE|DELETE)\b/i);

  if (queryStart !== -1) {
    query = query.slice(queryStart).trim();
  }

  return {
    schema: schema.trim(),
    query: query.trim(),
    rawContent: content,
  };
}

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "QueryMind AI",
    version: "3.0.0",
    agent: "Stable Rule-based SQL Optimization Agent",
  });
});

app.post("/api/analyze", (req, res) => {
  const { query, schema } = req.body;

  const cleanQuery = query ? query.trim() : "";
  const cleanSchema = schema ? schema.trim() : "";

  if (!cleanQuery && !cleanSchema) {
    return res.status(400).json({
      error: "Please enter a SQL query or provide a database schema.",
    });
  }

  try {
    if (!cleanQuery && cleanSchema) {
      const schemaInfo = parseSchema(cleanSchema);

      return res.json({
        mode: "SCHEMA_ONLY",
        score: 100,
        riskLevel: "Good",
        issues: [],
        recommendations: [
          "Schema parsed successfully. Now enter a SQL query to detect bottlenecks and index gaps."
        ],
        indexes: [],
        optimizedQuery: "",
        optimizedNotes: [],
        impact: {
          level: "Schema Ready",
          estimatedImprovement: "N/A",
          explanation: "Schema was parsed successfully. Query-level prediction requires a SQL query."
        },
        explainPlanHint: [
          "Schema is ready. Enter a SQL query to generate EXPLAIN-style predictions."
        ],
        agent: {
          name: "QueryMind AI Agent",
          mode: "Schema Inspection Mode",
          summary: {
            summary: `Schema parsed successfully. Detected ${Object.keys(schemaInfo.tables).length} table(s) and ${schemaInfo.indexedColumns.size} indexed column(s).`,
            score: 100,
            riskLevel: "Good",
            detectedProblems: 0,
            suggestedIndexes: 0,
            joinCount: 0,
            subqueryDepth: 0,
            queryType: "SCHEMA_ONLY",
          },
          reasoning: [
            {
              step: 1,
              title: "Schema scan complete",
              detail: "I parsed CREATE TABLE blocks and detected columns, primary keys, unique columns, and declared indexes."
            },
            {
              step: 2,
              title: "Waiting for query",
              detail: "Add a SQL query to compare query columns against this schema."
            }
          ],
          actionPlan: [
            {
              priority: 1,
              action: "Enter a SQL query and click Analyze.",
              reason: "Schema alone cannot reveal query bottlenecks.",
              expectedBenefit: "Enables JOIN, WHERE, ORDER BY, and GROUP BY index-gap detection."
            }
          ],
          confidence: 90,
          disclaimer: "Schema-only mode validates schema parsing. Query analysis starts after SQL query input."
        },
        metadata: {
          analyzedAt: new Date().toISOString(),
          schemaTablesDetected: Object.keys(schemaInfo.tables),
          indexedColumnsFromSchema: [...schemaInfo.indexedColumns],
          tableDetails: Object.fromEntries(
            Object.entries(schemaInfo.tables).map(([table, data]) => [
              table,
              {
                columns: [...data.columns],
                indexes: [...data.indexes],
                primaryKeys: [...data.primaryKeys],
              }
            ])
          ),
          hasWhereClause: false,
          hasLimit: false,
          joinCount: 0,
          subqueryDepth: 0,
        }
      });
    }

    const result = analyzeSQL(cleanQuery, cleanSchema);
    res.json(result);
  } catch (err) {
    console.error("Analysis error:", err);
    res.status(500).json({
      error: "Analysis failed: " + err.message,
    });
  }
});

app.post("/api/parse-sql-file", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: "No file uploaded.",
    });
  }

  try {
    const content = req.file.buffer.toString("utf8");
    const parsed = parseSqlFile(content);
    res.json(parsed);
  } catch (err) {
    console.error("File parse error:", err);
    res.status(500).json({
      error: "File parsing failed: " + err.message,
    });
  }
});

app.post("/api/agent-chat", (req, res) => {
  const { message, lastAnalysis } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({
      error: "Message is required.",
    });
  }

  const text = message.toLowerCase();

  let reply =
    "I can help you understand SQL bottlenecks, index suggestions, risk score, and optimization steps.";

  if (text.includes("score")) {
    reply = lastAnalysis
      ? `Your current optimization score is ${lastAnalysis.score}/100 with risk level "${lastAnalysis.riskLevel}".`
      : "Run an analysis first, then I can explain your optimization score.";
  } else if (text.includes("index")) {
    if (lastAnalysis?.indexes?.length) {
      reply = `I found ${lastAnalysis.indexes.length} index suggestion(s). Highest priority: ${lastAnalysis.indexes[0].statement}`;
    } else {
      reply =
        "I do not see index suggestions yet. Provide schema and run analysis for better index recommendations.";
    }
  } else if (text.includes("optimize") || text.includes("fix")) {
    if (lastAnalysis?.agent?.actionPlan?.length) {
      reply = `Start with this fix: ${lastAnalysis.agent.actionPlan[0].action}`;
    } else {
      reply =
        "Paste a SQL query and schema, then I will generate a step-by-step optimization plan.";
    }
  } else if (text.includes("explain")) {
    if (lastAnalysis?.explainPlanHint?.length) {
      reply = lastAnalysis.explainPlanHint.join(" ");
    } else {
      reply =
        "Run EXPLAIN ANALYZE in your database to validate actual execution time, scanned rows, and index usage.";
    }
  }

  res.json({
    agent: "QueryMind AI Agent",
    reply,
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`QueryMind AI backend running on port ${PORT}`);
});