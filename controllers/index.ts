import { Request, Response } from 'express';
import * as CharacterService from '../services';

export const getAllCharacters = async (_req: Request, res: Response) => {
  try {
    const characters = await CharacterService.getAll();

    res.status(200).json(characters);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCharacterById = async (req: Request, res: Response) => {
  try {
    const character = await CharacterService.getById(req.params.id);

    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    res.status(200).json(character);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCharacter = async (req: Request, res: Response) => {
  try {
    const created = await CharacterService.create(req.body);

    res.status(201).json(created);
  } catch (err: unknown) {
    const error = err as { status?: number; message: string };

    res.status(error.status || 500).json({ error: error.message });
  }
};

export const updateCharacter = async (req: Request, res: Response) => {
  try {
    const updated = await CharacterService.update(req.params.id, req.body);

    res.status(200).json(updated);
  } catch (err: unknown) {
    const error = err as { status?: number; message: string };

    res.status(error.status || 500).json({ error: error.message });
  }
};

export const deleteCharacter = async (req: Request, res: Response) => {
  try {
    const result = await CharacterService.remove(req.params.id);

    res.status(200).json(result);
  } catch (err: unknown) {
    const error = err as { status?: number; message: string };

    res.status(error.status || 500).json({ error: error.message });
  }
};
