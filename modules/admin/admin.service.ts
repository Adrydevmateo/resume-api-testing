import { Database } from "bun:sqlite";

export class Admin {
  constructor(private db: Database) {
    this.createTableIfNotExists();
  }

  createTableIfNotExists() {
    const query = this.db.query(
      `CREATE TABLE IF NOT EXISTS Admin (
        id TEXT PRIMARY KEY,
        password TEXT NOT NULL
      )`,
    );

    query.run();
    query.finalize();
  }

  dropTableIfExists() {
    const query = this.db.query("DROP TABLE IF EXISTS Admin");
    query.run();
    query.finalize();
  }

  getAdmins() {
    const query = this.db.query("SELECT * FROM Admin");
    const result = query.all();
    return result;
  }

  getAdminById(id: string) {
    const query = this.db.query("SELECT * FROM Admin WHERE id = $id");
    const result = query.get({ id });
    if (!result) return false;
    return true;
  }

  insertAdmin({ id, password }: { id: string; password: string }) {
    const query = this.db.query(
      "INSERT INTO Admin (id, password) VALUES ($id, $password)",
    );
    const data = {
      id: id,
      password: password,
    };
    const result = query.run(data);
    return result;
  }
}
