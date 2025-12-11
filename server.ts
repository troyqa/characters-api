import express from 'express';
// import FirebaseDB from './services/firebase_db';
import admin from 'firebase-admin';
import rateLimiter from './middlewares/rate_limiter';
import swaggerDocs from './swagger';
import { db } from './firebase';

interface ICharacter {
  id?: string;
  name: string;
  description: string;
  skills: string[];
  avatarUrl?: string;
}

const app = express();
const PORT = 3005;

app.use(rateLimiter({
  windowMs: 60, maxRequests: 60,
}));
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
 *                     type: string
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
app.get('/characters', async (_req, res) => {
  const charactersSnapshot = await db.collection('characters').get();

  const characters = charactersSnapshot.docs.map((character) => ({
    id: character.id,
    ...character.data(),
  }));

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
 *           type: string
 *         description: The character ID
 *     responses:
 *       200:
 *         description: ICharacter found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
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
 *         description: ICharacter not found
 */
app.get('/characters/:id', async (req, res) => {
  const character = await db.collection('characters').doc(req.params.id).get();

  if (!character.exists) {
    res.status(404).json({ message: 'Character not found' });

    return;
  }

  res.status(200).json({
    id: character.id, ...character.data(),
  });
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
 *         description: ICharacter created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
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
app.post('/characters', async (req, res) => {
  try {
    const {
      name, description, skills, avatarUrl,
    } = req.body;

    // Validate required fields
    if (!name || !description || !skills) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'description', 'skills'],
      });
    }

    // Validate skills is an array
    if (!Array.isArray(skills)) {
      return res.status(400).json({ error: 'skills must be an array' });
    }

    const character: ICharacter = {
      name,
      description,
      skills,
      avatarUrl,
    };

    // Create doc
    const docRef = await db.collection('characters').add({
      ...character,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Fetch created doc
    const snap = await docRef.get();
    const data = snap.data();

    // Convert timestamps
    const converted = {
      id: docRef.id,
      ...data,
      createdAt: data?.createdAt.toDate().toISOString(),
    };

    res.status(201).json(converted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
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
 *           type: string
 *         description: ICharacter ID
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
 *         description: ICharacter updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
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
 *         description: ICharacter not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: ICharacter not found
 */
app.put('/characters/:id', async (req, res) => {
  try {
    const characterRef = db.collection('characters').doc(req.params.id);
    const characterSnap = await characterRef.get();

    if (!characterSnap.exists) {
      return res.status(404).json({ error: 'Character not found' });
    }

    const forbidden = ['id', 'createdAt'];

    for (const key of Object.keys(req.body)) {
      if (forbidden.includes(key)) {
        return res.status(400).json({ error: `Field "${key}" cannot be updated` });
      }
    }

    const updateData = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await characterRef.update(updateData);

    const updatedSnap = await characterRef.get();

    return res.status(200).json({
      id: updatedSnap.id,
      ...updatedSnap.data(),
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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
 *           type: string
 *         description: ICharacter ID
 *     responses:
 *       204:
 *         description: ICharacter deleted successfully
 *       404:
 *         description: ICharacter not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: ICharacter not found
 */
app.delete('/characters/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const ref = db.collection('characters').doc(id);
    const snap = await ref.get();

    if (!snap.exists) {
      return res.status(404).json({ error: 'Character not found' });
    }

    const data = snap.data();

    await ref.delete();

    res.status(200).json({
      id,
      deleted: true,
      ...data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

swaggerDocs(app);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/docs`);
});
