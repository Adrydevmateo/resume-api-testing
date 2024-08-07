import { Database } from "bun:sqlite";
import type { TUser } from "./user.types";

export class UserService {
  constructor(private db: Database) {
    this.createTableIfNotExists();
  }

  createTableIfNotExists() {
    const query = this.db.query(
      `CREATE TABLE IF NOT EXISTS User (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        password TEXT NOT NULL,
        token TEXT NOT NULL
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

  isAuthorized(id: string, token: string) {
    const found: any = this.getUserById(id);
    if (`Bearer ${found.token}` === token) return true;
    return false;
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
      "INSERT INTO User (id, email, password, token) VALUES ($id, $email, $password, $token)",
    );
    const data = {
      ...user,
      token: crypto.randomUUID(),
    };
    const result = query.run(data);
    return result.changes;
  }

  updateUser(user: TUser) {
    const query = this.db.query(`
      UPDATE User
      SET email = $email, 
          password = $password
      WHERE id = $id
    `);

    const found: any = this.getUserById(user.id);

    const data = {
      id: user.id,
      email: user.email,
      password: user.password,
    };

    if (user.email === found.email) data.email = found.email;
    if (user.password === found.password) data.password = found.password;

    const result = query.run(data);
    let msg = "User not found";
    if (result.changes) msg = `User with id(${user.id}) successfully updated!`;
    return msg;
  }

  deleteUser(id: string) {
    const query = this.db.query("DELETE FROM User WHERE id = $id");
    const result = query.run({ id });
    query.finalize();
    let msg = `User with id(${id}) was not found`;
    if (result.changes) msg = `User with id(${id}) has been deleted!`;
    return msg;
  }
}
