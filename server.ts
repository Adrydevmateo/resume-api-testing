import { Database } from "bun:sqlite";
import { User } from "./modules/user";

const db = new Database("./ResumeDB.sqlite", { strict: true });

const user = new User(db);

user.createTableIfNotExists();

//user.dropTableIfExists();

//user.insertUsers([
//  {
//    id: crypto.randomUUID(),
//    email: "dante@dmc.com",
//    password: "123",
//  },
//  {
//    id: crypto.randomUUID(),
//    email: "vergil@dmc.com",
//    password: "213",
//  },
//  {
//    id: crypto.randomUUID(),
//    email: "nero@dmc.com",
//    password: "321",
//  },
//  {
//    id: crypto.randomUUID(),
//    email: "v@dmc.com",
//    password: "1",
//  },
//]);

//user.deleteUser("");

//user.updateUser({
//  id: "",
//  email: "vedited@dmc.edited",
//  password: "1",
//});

//user.getUsers();

//db.close();

// TODO: Create a collection of tokens to add a token to every user
const isAuthorized = (headers: Headers) => headers.get("authorization");

const server = Bun.serve({
  async fetch(req: Request) {
    if (!isAuthorized(req.headers))
      return new Response("Unauthorized", { status: 401 });

    const { method } = req;
    const { pathname } = new URL(req.url);

    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);

    if (method === "GET" && pathname.includes("/api/users")) {
      const users = user.getUsers();
      if (!users) return new Response("No users found");
      return new Response(JSON.stringify(users), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (method === "GET" && pathname.includes("/api/get_user")) {
      const id = searchParams.get("id");
      if (!id) return new Response("User id not provided", { status: 404 });

      const found = user.getUserById(id);
      if (!found) return new Response("User not found", { status: 404 });

      return new Response(JSON.stringify(found), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (method === "POST" && pathname.includes("/api/create_user")) {
      if (!req.body)
        return new Response("Request body not provided", { status: 404 });

      try {
        const { id, email, password } = await req.json();

        const newUser = { id, email, password };
        const inserted = user.insertUser(newUser);

        if (!inserted) return new Response("User couldn't be inserted");

        return new Response("User inserted successfully!");
      } catch (error: any) {
        return new Response(error);
      }
    }

    if (method === "PATCH" && pathname === "/api/update_user") {
      // Update user
    }

    if (method === "DELETE" && pathname === "/api/delete_user") {
      // Delete user
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log("Running on port:", server.port);
