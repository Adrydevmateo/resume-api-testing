import { Database } from "bun:sqlite";
import { UserService } from "./modules/user/user.service";
import { UserController } from "./modules/user/user.controller";
import { Admin } from "./modules/admin/admin.service";

const db = new Database("./ResumeDB.sqlite", { strict: true });

const admin = new Admin(db);
const userService = new UserService(db);
const userController = new UserController(userService);

const getAdminResult = admin.getAdminById("123");
if (!getAdminResult) admin.insertAdmin({ id: "123", password: "123" });

// TODO: Create a collection of tokens to add a token to every user
//const isAuthorized = (headers: Headers) => headers.get("authorization");

const server = Bun.serve({
  async fetch(req: Request) {
    //if (!isAuthorized(req.headers))
    //  return new Response("Unauthorized", { status: 401 });

    const { method } = req;
    const { pathname } = new URL(req.url);

    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);

    if (method === "GET" && pathname.includes("/api/users"))
      return userController.getUsers();

    if (method === "GET" && pathname.includes("/api/get_user"))
      return userController.getUser(req.headers, searchParams);

    if (method === "POST" && pathname.includes("/api/create_user"))
      return await userController.createUser(req);

    if (method === "PATCH" && pathname.includes("/api/update_user"))
      return await userController.updateUser(req);

    if (method === "DELETE" && pathname.includes("/api/delete_user"))
      return userController.deleteUser(req.headers, searchParams);

    return new Response("Route Not Found", { status: 404 });
  },
});

console.log("Running on port:", server.port);
