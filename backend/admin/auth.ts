"use server";

import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/backend/db/prisma";

const SESSION_COOKIE = "rutafuturo_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

type AuthResult = {
  error?: string;
  ok?: boolean;
};

export async function obtenerAdminActual() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;
  const payload = verificarSesion(session);

  if (!payload) return null;

  const user = await prisma.adminUser.findFirst({
    where: {
      id: payload.userId,
      isActive: true,
    },
    select: {
      email: true,
      id: true,
      name: true,
      role: true,
    },
  });

  return user;
}

export async function requerirAdminActual() {
  const user = await obtenerAdminActual();

  if (!user) {
    redirect("/ingresar");
  }

  return user;
}

export async function existeUsuarioAdministrador() {
  const count = await prisma.adminUser.count();

  return count > 0;
}

export async function iniciarSesionAdministrador(
  _previousState: AuthResult,
  formData: FormData,
): Promise<AuthResult> {
  const email = normalizarEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Ingresa administrador y contraseña." };
  }

  const user = await prisma.adminUser.findUnique({
    where: { email },
  });

  if (!user || !user.isActive || !verificarPassword(password, user.passwordHash)) {
    return { error: "Credenciales no validas o usuario sin acceso." };
  }

  await prisma.adminUser.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  await guardarSesion(user.id);
  redirect("/admin");
}

export async function cerrarSesionAdministrador() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/ingresar");
}

export async function crearPrimerAdministrador(
  _previousState: AuthResult,
  formData: FormData,
): Promise<AuthResult> {
  const hasUsers = await existeUsuarioAdministrador();

  if (hasUsers) {
    return { error: "La configuracion inicial ya fue completada." };
  }

  const email = normalizarEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");

  if (!email || password.length < 8) {
    return { error: "Ingresa administrador y una contraseña de al menos 8 caracteres." };
  }

  try {
    await prisma.adminUser.create({
      data: {
        email,
        name: "Administrador",
        passwordHash: crearPasswordHash(password),
      },
    });
  } catch {
    return { error: "No se pudo crear el primer acceso." };
  }

  const user = await prisma.adminUser.findUnique({
    where: { email },
  });

  if (!user) {
    return { error: "No se pudo iniciar sesión con el usuario creado." };
  }

  await guardarSesion(user.id);
  redirect("/admin");
}

export async function crearUsuarioAdministrador(
  _previousState: AuthResult,
  formData: FormData,
): Promise<AuthResult> {
  await requerirAdminActual();

  const result = await crearUsuarioAdministradorDesdeFormulario(formData);
  if (result.ok) {
    revalidatePath("/admin");
  }

  return result;
}

export async function actualizarRolAdministrador(formData: FormData) {
  await requerirAdminActual();

  const id = Number(formData.get("id"));
  const role = String(formData.get("role") ?? "");
  const allowedRoles = new Set(["ADMIN", "ANALISTA", "LECTOR"]);

  if (!Number.isInteger(id) || !allowedRoles.has(role)) return;

  await prisma.adminUser.update({
    where: { id },
    data: { role },
  });

  revalidatePath("/admin/accesos");
}

export async function cambiarEstadoAdministrador(formData: FormData) {
  await requerirAdminActual();

  const id = Number(formData.get("id"));
  const isActive = formData.get("isActive") === "true";

  if (!Number.isInteger(id)) return;

  await prisma.adminUser.update({
    where: { id },
    data: { isActive },
  });

  revalidatePath("/admin/accesos");
}

export async function restablecerPasswordAdministrador(formData: FormData) {
  await requerirAdminActual();

  const id = Number(formData.get("id"));
  const password = String(formData.get("password") ?? "");

  if (!Number.isInteger(id) || password.length < 8) return;

  await prisma.adminUser.update({
    where: { id },
    data: { passwordHash: crearPasswordHash(password) },
  });

  revalidatePath("/admin/accesos");
}

async function crearUsuarioAdministradorDesdeFormulario(formData: FormData): Promise<AuthResult> {
  const name = String(formData.get("name") ?? "").trim();
  const email = normalizarEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");

  if (!name || !email || password.length < 8) {
    return {
      error: "Completa nombre, usuario y una contraseña de al menos 8 caracteres.",
    };
  }

  try {
    await prisma.adminUser.create({
      data: {
        email,
        name,
        passwordHash: crearPasswordHash(password),
      },
    });

    return { ok: true };
  } catch {
    return { error: "Ese correo ya tiene acceso o no pudo registrarse." };
  }
}

function normalizarEmail(value: FormDataEntryValue | null) {
  return String(value ?? "").trim().toLowerCase();
}

function crearPasswordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex");

  return `pbkdf2_sha256$120000$${salt}$${hash}`;
}

function verificarPassword(password: string, storedHash: string) {
  const [algorithm, iterationsValue, salt, hash] = storedHash.split("$");
  const iterations = Number(iterationsValue);

  if (algorithm !== "pbkdf2_sha256" || !salt || !hash || !Number.isInteger(iterations)) {
    return false;
  }

  const candidate = pbkdf2Sync(password, salt, iterations, 32, "sha256");
  const expected = Buffer.from(hash, "hex");

  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

async function guardarSesion(userId: number) {
  const cookieStore = await cookies();
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = `${userId}.${expiresAt}`;
  const signature = firmar(payload);

  cookieStore.set(SESSION_COOKIE, `${payload}.${signature}`, {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

function verificarSesion(value: string | undefined) {
  if (!value) return null;

  const [userIdValue, expiresAtValue, signature] = value.split(".");
  const payload = `${userIdValue}.${expiresAtValue}`;
  const expectedSignature = firmar(payload);
  const userId = Number(userIdValue);
  const expiresAt = Number(expiresAtValue);

  if (!Number.isInteger(userId) || !Number.isFinite(expiresAt)) return null;
  if (expiresAt < Date.now()) return null;
  if (signature !== expectedSignature) return null;

  return { userId };
}

function firmar(payload: string) {
  return createHmac("sha256", obtenerAuthSecret()).update(payload).digest("hex");
}

function obtenerAuthSecret() {
  return process.env.AUTH_SECRET ?? process.env.DATABASE_URL ?? "rutafuturo-dev-secret";
}
