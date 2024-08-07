import type { UserService } from "./user.service";

export class UserController {
  constructor(private userService: UserService) {}

  getUsers(): Response {
    const users = this.userService.getUsers();
    if (!users) return new Response("No users found");
    return new Response(JSON.stringify(users), {
      headers: { "Content-Type": "application/json" },
    });
  }

  getUser(searchParams: URLSearchParams): Response {
    const id = searchParams.get("id");
    if (!id) return new Response("User id not provided", { status: 404 });

    const found = this.userService.getUserById(id);
    if (!found) return new Response("User not found", { status: 404 });

    return new Response(JSON.stringify(found), {
      headers: { "Content-Type": "application/json" },
    });
  }

  async createUser(req: Request): Promise<Response> {
    if (!req.body)
      return new Response("Request body not provided", { status: 404 });

    try {
      const { id, email, password } = await req.json();

      const newUser = { id, email, password };
      const inserted = this.userService.insertUser(newUser);

      if (!inserted) return new Response("User couldn't be inserted");

      return new Response("User inserted successfully!", { status: 201 });
    } catch (error: any) {
      return new Response(error);
    }
  }

  async updateUser(req: Request): Promise<Response> {
    if (!req.body)
      return new Response("Request body not provided", { status: 404 });

    try {
      const { id, email, password } = await req.json();

      const dataForUser = { id, email, password };
      const updatedUser = this.userService.updateUser(dataForUser);

      return new Response(updatedUser, { status: 200 });
    } catch (error: any) {
      return new Response(error);
    }
  }

  deleteUser(searchParams: URLSearchParams): Response {
    const id = searchParams.get("id");
    if (!id) return new Response("User id not provided", { status: 404 });

    const found = this.userService.getUserById(id);
    if (!found) return new Response("User not found", { status: 404 });

    const deletedUser = this.userService.deleteUser(id);

    return new Response(deletedUser);
  }
}
