import { Database } from "bun:sqlite";
import type { IUserServiceResponse, TUser } from "./user.types";

// TODO: Add an ADMIN account
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
    const found = this.getUserById(id);
    if (found.data) if (`Bearer ${found.data.token}` === token) return true;
    return false;
  }

  getUsers() {
    const query = this.db.query("SELECT * FROM User");
    const result = query.all();
    return result;
  }

  getUserById(id: string): IUserServiceResponse<TUser> {
    const query = this.db.query("SELECT * FROM User WHERE id = $id");
    const result = query.get({ id }) as TUser | null;
    if (!result) return { OK: false, msg: "User not found", statusCode: 404 };
    return { OK: true, data: result };
  }

  insertUser(user: TUser): IUserServiceResponse<null> {
    const query = this.db.query(
      "INSERT INTO User (id, email, password, token) VALUES ($id, $email, $password, $token)",
    );
    user.id = crypto.randomUUID();
    user.token = crypto.randomUUID();
    const result = query.run(user);
    if (!result) return { OK: false, msg: "User not found", statusCode: 404 };
    return { OK: true, msg: "User inserted successfully!", statusCode: 201 };
  }

  updateUser(user: TUser): IUserServiceResponse<TUser> {
    const found = this.getUserById(user.id);
    if (!found.OK || !found.data)
      return { OK: false, msg: found.msg, statusCode: found.statusCode };

    const data: TUser = {
      id: user.id,
      email: user.email,
      password: user.password,
    };

    if (user.email === found.data.email) data.email = found.data.email;
    if (user.password === found.data.password)
      data.password = found.data.password;

    const query = this.db.query(`
      UPDATE User
      SET email = $email, 
          password = $password
      WHERE id = $id
    `);

    const result = query.run(data);
    if (!result.changes)
      return { OK: false, msg: "User data was not updated", statusCode: 400 };
    return {
      OK: true,
      msg: "User data successfully updated!",
      statusCode: 204,
    };
  }

  deleteUser(id: string): IUserServiceResponse<null> {
    const query = this.db.query("DELETE FROM User WHERE id = $id");
    const result = query.run({ id });
    query.finalize();
    if (!result.changes)
      return { OK: false, msg: "User was not deleted", statusCode: 400 };
    return {
      OK: true,
      msg: "User has been successfully deleted!",
      statusCode: 204,
    };
  }
}
