import { Database } from "bun:sqlite";
import type { TUser } from "./user.types";

export class User {
  constructor(private db: Database) { }

  createTableIfNotExists() {
    const query = this.db.query(
      `CREATE TABLE IF NOT EXISTS User (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        password TEXT NOT NULL
      )`,
    );

    query.run();
    query.finalize();
  }

  dropTableIfExists() {
    const query = this.db.query("DROP TABLE IF EXISTS User");
    query.run();
    query.finalize();
  }

  getUsers() {
    const query = this.db.query("SELECT * FROM User");
    const result = query.all();
    return result;
  }

  getUserById(id: string) {
    const query = this.db.query("SELECT * FROM User WHERE id = $id");
    const result = query.get({ id });
    return result;
  }

  insertUser(user: TUser) {
    const query = this.db.query(
      "INSERT INTO User (id, email, password) VALUES ($id, $email, $password)",
    );
    const result = query.run(user);
    return result.changes;
  }

  updateUser(user: TUser) {
    const query = this.db.query(`
      UPDATE User
      SET email = $email, 
          password = $password
      WHERE id = $id
    `);

    const result = query.run(user);
    let msg = "User not found";
    if (result.changes) msg = `User with id(${user.id}) successfully updated!`;
    console.log(msg);
  }

  deleteUser(id: string) {
    const query = this.db.query("DELETE FROM User WHERE id = $id");
    const result = query.run({ id });
    query.finalize();
    let msg = `User with id(${id}) was not found`;
    if (result.changes) msg = `User with id(${id}) has been deleted!`;
    console.log(msg);
  }
}
