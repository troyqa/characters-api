import { promises as fs } from 'fs';
import { existsSync } from 'fs';
import path from 'path';

export default class FileDB {
  private dir: string;

  constructor(dir: string) {
    this.dir = dir;

    if (!existsSync(dir)) {
      fs.mkdir(dir, { recursive: true });
    }
  }

  private filePath(file: string): string {
    return path.join(this.dir, `${file}.json`);
  }

  async read<T = any>(file: string): Promise<T | null> {
    const f = this.filePath(file);

    if (!existsSync(f)) return null;

    const content = await fs.readFile(f, 'utf8');

    return JSON.parse(content) as T;
  }

  async write<T = any>(file: string, data: T): Promise<void> {
    const f = this.filePath(file);
    await fs.writeFile(f, JSON.stringify(data, null, 2), 'utf8');
  }

  async push<T = any>(file: string, item: T): Promise<T> {
    const data = (await this.read<T[]>(file)) || [];
    data.push(item);
    await this.write(file, data);

    return item;
  }

  async update<T extends object>(
    file: string,
    predicate: (item: T) => boolean,
    changes: Partial<T>
  ): Promise<T[]> {
    const data = (await this.read<T[]>(file)) || [];
    const updated = data.map((item) =>
      predicate(item) ? { ...item, ...changes } : item
    );
    await this.write(file, updated);

    return updated;
  }

  async delete<T>(
    file: string,
    predicate: (item: T) => boolean
  ): Promise<T[]> {
    const data = (await this.read<T[]>(file)) || [];
    const filtered = data.filter((item) => !predicate(item));
    await this.write(file, filtered);

    return filtered;
  }
}
