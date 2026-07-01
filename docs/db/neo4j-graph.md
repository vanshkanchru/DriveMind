# DriveMind Neo4j Collective Memory Graph

## 1. Purpose

Neo4j is used to store DriveMind's collective vehicle memory as a knowledge graph.

MongoDB stores raw telemetry and experience documents.

Neo4j stores relationships between:

- vehicles
- road segments
- weather conditions
- risk events
- recommended actions

This helps DriveMind answer:

> What happened here before, under which condition, and what should the next vehicle do?

---

## 2. Graph Nodes

DriveMind currently creates these node types:

```text
Vehicle
Experience
RoadSegment
Weather
Event
Action
```

---

## 3. Graph Relationships

Current relationships:

```text
(:Vehicle)-[:EXPERIENCED]->(:Experience)
(:Experience)-[:AT]->(:RoadSegment)
(:Experience)-[:DURING]->(:Weather)
(:Experience)-[:TYPE]->(:Event)
(:Experience)-[:SUGGESTS]->(:Action)
```

---

## 4. Example Graph

```text
Vehicle_graph_01
        ↓ EXPERIENCED
Experience
        ↓ AT
Curve_42
        ↓ DURING
Rain
        ↓ TYPE
High Speed Risk
        ↓ SUGGESTS
Reduce Speed Immediately
```

---

## 5. Neo4j Local Setup

Neo4j runs using Docker.

Browser URL:

```text
http://localhost:7474
```

Bolt URL:

```text
bolt://localhost:7687
```

Credentials used locally:

```text
Username: neo4j
Password: drivemind123
```

---

## 6. Test Query

Use this query in Neo4j Browser:

```cypher
MATCH (n)-[r]->(m)
RETURN n, r, m
LIMIT 50;
```

This displays the collective memory graph.

---

## 7. Current Backend Flow

```text
Risky telemetry received
        ↓
Risk score calculated
        ↓
Experience saved in MongoDB
        ↓
Graph memory created in Neo4j
        ↓
Vehicle, road, weather, event, and action are connected
```

---

## 8. Why Neo4j Is Useful

Neo4j makes the project stronger because it gives DriveMind a real knowledge graph layer.

This supports queries like:

- Which road segments have repeated near misses?
- Which weather condition causes the most risk?
- Which recommendation is most common for a risky road?
- Which vehicles experienced similar events?
- Which event type is most frequent at a road segment?

---

## 9. Future Graph Queries

Example future query:

```cypher
MATCH (r:RoadSegment)<-[:AT]-(exp:Experience)-[:DURING]->(w:Weather)
RETURN r.roadSegmentId, w.type, count(exp) AS riskEvents
ORDER BY riskEvents DESC;
```

This can identify road segments with repeated weather-related risks.