const { getNeo4jDriver } = require("../config/neo4j");

const getGraphOverview = async (req, res) => {
  const driver = getNeo4jDriver();

  if (!driver) {
    return res.status(503).json({
      success: false,
      message: "Neo4j driver not available"
    });
  }

  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (n)-[r]->(m)
      RETURN n, r, m
      LIMIT 50
      `
    );

    const relationships = result.records.map((record) => {
      const startNode = record.get("n");
      const relationship = record.get("r");
      const endNode = record.get("m");

      return {
        start: {
          labels: startNode.labels,
          properties: startNode.properties
        },
        relationship: {
          type: relationship.type,
          properties: relationship.properties
        },
        end: {
          labels: endNode.labels,
          properties: endNode.properties
        }
      };
    });

    res.json({
      success: true,
      count: relationships.length,
      data: relationships
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch graph overview",
      error: error.message
    });
  } finally {
    await session.close();
  }
};

module.exports = {
  getGraphOverview
};