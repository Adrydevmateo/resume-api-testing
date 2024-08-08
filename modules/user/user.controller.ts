import type { UserService } from "./user.service";

export class UserController {
  constructor(private userService: UserService) {}

  checkAuthorization(headers: Headers, id: string) {
    const token = headers.get("authorization");
    if (!token) return new Response("Token was not provided", { status: 404 });

    const authorized = this.userService.isAuthorized(id, token);
    if (!authorized)
      return new Response("User not authorized", {
        status: 401,
        headers: {
          "WWW-Authenticate": "Bearer 'token'",
        },
      });

    return false;
  }

  // TODO: Return only the email
  getUsers(): Response {
    const users = this.userService.getUsers();
    if (!users) return new Response("No users found");
    return new Response(JSON.stringify(users), {
      headers: { "Content-Type": "application/json" },
    });
  }

  getUser(headers: Headers, searchParams: URLSearchParams): Response {
    const id = searchParams.get("id");
    if (!id) return new Response("User id not provided", { status: 404 });

    const unauthorized = this.checkAuthorization(headers, id);
    if (unauthorized) return unauthorized;

    const found = this.userService.getUserById(id);
    if (!found.OK) return new Response(found.msg, { status: found.statusCode });

    return new Response(JSON.stringify(found.data), {
      headers: { "Content-Type": "application/json" },
    });
  }

  async createUser(req: Request): Promise<Response> {
    if (!req.body)
      return new Response("Request body not provided", { status: 404 });

    try {
      const { email, password } = await req.json();
      const newUser = { id: "", email, password };
      const inserted = this.userService.insertUser(newUser);
      return new Response(inserted.msg, { status: inserted.statusCode });
    } catch (error: any) {
      return new Response(error);
    }
  }

  async updateUser(req: Request): Promise<Response> {
    if (!req.body)
      return new Response("Request body not provided", { status: 404 });

    try {
      const { id, email, password } = await req.json();
      if (!id) return new Response("User id not provided", { status: 404 });

      const unauthorized = this.checkAuthorization(req.headers, id);
      if (unauthorized) return unauthorized;

      const dataForUser = { id, email, password };
      const updatedUser = this.userService.updateUser(dataForUser);
      return new Response(updatedUser.msg, { status: updatedUser.statusCode });
    } catch (error: any) {
      return new Response(error);
    }
  }

  deleteUser(headers: Headers, searchParams: URLSearchParams): Response {
    const id = searchParams.get("id");
    if (!id) return new Response("User id not provided", { status: 404 });

    const unauthorized = this.checkAuthorization(headers, id);
    if (unauthorized) return unauthorized;

    const found = this.userService.getUserById(id);
    if (!found.OK) return new Response(found.msg, { status: found.statusCode });

    const deletedUser = this.userService.deleteUser(id);
    return new Response(deletedUser.msg, { status: deletedUser.statusCode });
  }
}
