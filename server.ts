import express from "express";
import FileDB from "./services/file_db";
import rateLimiter from "./middlewares/rate_limiter";
import swaggerDocs from "./swagger";

interface Character {
  id: number;
  name: string;
  description: string;
  skills: string[];
  avatarUrl?: string;
}

const app = express();
const PORT = 3005;
const db = new FileDB("./data");

app.use(rateLimiter({ windowMs: 60, maxRequests: 60 }));
app.use(express.json());

/**
 * @swagger
 * /characters:
 *   get:
 *     summary: Get all characters
 *     description: Retrieve a list of all characters
 *     tags:
 *       - Characters
 *     responses:
 *       200:
 *         description: A list of characters
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: Spider-Man
 *                   description:
 *                     type: string
 *                     example: Friendly neighborhood superhero
 *                   skills:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["Wall-crawling", "Spider-sense"]
 *                   avatarUrl:
 *                     type: string
 *                     example: ""
 */
app.get("/characters", async (_req, res) => {
  const characters = (await db.read<Character[]>("characters")) || [];
  res.status(200).json(characters);
});

/**
 * @swagger
 * /characters/{id}:
 *   get:
 *     summary: Get a character by ID
 *     description: Retrieve a single character by their ID
 *     tags:
 *       - Characters
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The character ID
 *     responses:
 *       200:
 *         description: Character found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: Spider-Man
 *                 description:
 *                   type: string
 *                   example: Friendly neighborhood superhero
 *                 skills:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Wall-crawling", "Spider-sense"]
 *                 avatarUrl:
 *                   type: string
 *                   example: ""
 *       404:
 *         description: Character not found
 */
app.get("/characters/:id", async (req, res) => {
  const characters = (await db.read<Character[]>("characters")) || [];
  const character = characters.find(c => c.id === parseInt(req.params.id));
  
  if (!character) {
    res.status(404).json({ message: "Character not found" });
    return;
  }
  
  res.status(200).json(character);
});

/**
 * @swagger
 * /characters:
 *   post:
 *     summary: Create a new character
 *     description: Add a new character to the database
 *     tags:
 *       - Characters
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - skills
 *             properties:
 *               name:
 *                 type: string
 *                 example: Spider-Man
 *               description:
 *                 type: string
 *                 example: Friendly neighborhood superhero
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Wall-crawling", "Spider-sense"]
 *               avatarUrl:
 *                 type: string
 *                 example: ""
 *     responses:
 *       201:
 *         description: Character created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 skills:
 *                   type: array
 *                   items:
 *                     type: string
 *                 avatarUrl:
 *                   type: string
 */
app.post("/characters", async (req, res) => {
  // Validate required fields
  if (!req.body.name || !req.body.description || !req.body.skills) {
    return res.status(400).json({ 
      error: "Missing required fields",
      required: ["name", "description", "skills"]
    });
  }

  // Validate skills is an array
  if (!Array.isArray(req.body.skills)) {
    return res.status(400).json({ 
      error: "skills must be an array"
    });
  }

  const characters = (await db.read<Character[]>("characters")) || [];
  const maxId = characters.length > 0 ? Math.max(...characters.map(c => c.id)) : 0;

  const character: Character = {
    id: maxId + 1,
    name: req.body.name,
    description: req.body.description,
    skills: req.body.skills,
    avatarUrl: req.body.avatarUrl,
  };

  await db.push("characters", character);
  res.status(201).json(character);
});

/**
 * @swagger
 * /characters/{id}:
 *   put:
 *     summary: Update a character
 *     description: Update an existing character by ID
 *     tags:
 *       - Characters
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Character ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               avatarUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Character updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 skills:
 *                   type: array
 *                   items:
 *                     type: string
 *                 avatarUrl:
 *                   type: string
 *       404:
 *         description: Character not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Character not found
 */
app.put("/characters/:id", async (req, res) => {
  const id = Number(req.params.id);

  const updated = await db.update<Character>(
    "characters",
    (c) => c.id === id,
    req.body
  );

  if (!updated) {
    return res.status(404).json({ error: "Character not found" });
  }

  res.status(200).json(updated);
});

/**
 * @swagger
 * /characters/{id}:
 *   delete:
 *     summary: Delete a character
 *     description: Delete a character by ID
 *     tags:
 *       - Characters
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Character ID
 *     responses:
 *       204:
 *         description: Character deleted successfully
 *       404:
 *         description: Character not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Character not found
 */
app.delete("/characters/:id", async (req, res) => {
  const id = Number(req.params.id);
  const characters = (await db.read<Character[]>("characters")) || [];
  const characterExists = characters.find((c) => c.id === id);
  
  if (!characterExists) {
    return res.status(404).json({ error: "Character not found" });
  }
  
  await db.delete<Character>("characters", (c) => c.id === id);
  res.status(204).send();
});

swaggerDocs(app);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/docs`);
});