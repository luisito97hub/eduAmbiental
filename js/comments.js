const form = document.querySelector("#comment-form");
const formStatus = document.querySelector("#comment-form-status");
const listStatus = document.querySelector("#comment-list-status");
const commentList = document.querySelector("#comment-list");
const submitButton = form.querySelector('button[type="submit"]');
const config = window.CORAL_COMMENTS_CONFIG;

function setStatus(element, message, state = "") {
  element.textContent = message;
  element.dataset.state = state;
}

function getCommentsEndpoint() {
  const url = config?.supabaseUrl?.trim();
  const anonKey = config?.supabaseAnonKey?.trim();

  if (!url || !anonKey) {
    return null;
  }

  let projectUrl;
  try {
    projectUrl = new URL(url);
  } catch {
    throw new Error("La URL de Supabase no es válida.");
  }

  if (projectUrl.protocol !== "https:") {
    throw new Error("La URL de Supabase debe usar HTTPS.");
  }

  return {
    url: new URL("/rest/v1/comments", projectUrl).toString(),
    anonKey,
  };
}

function requestHeaders(anonKey, includeContentType = false) {
  const headers = {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
  };

  if (includeContentType) {
    headers["Content-Type"] = "application/json";
    headers.Prefer = "return=minimal";
  }

  return headers;
}

function renderComment(comment) {
  const item = document.createElement("li");
  item.className = "comment-item";

  const header = document.createElement("div");
  header.className = "comment-item-header";

  const name = document.createElement("strong");
  name.textContent = comment.name;
  header.append(name);

  const date = document.createElement("time");
  const parsedDate = new Date(comment.created_at);
  if (!Number.isNaN(parsedDate.getTime())) {
    date.dateTime = parsedDate.toISOString();
    date.textContent = new Intl.DateTimeFormat("es", {
      dateStyle: "medium",
    }).format(parsedDate);
  }
  header.append(date);

  const message = document.createElement("p");
  message.textContent = comment.message;
  item.append(header, message);

  return item;
}

async function loadComments(endpoint) {
  const query = new URLSearchParams({
    select: "name,message,created_at",
    status: "eq.approved",
    order: "created_at.desc",
    limit: "50",
  });

  const response = await fetch(`${endpoint.url}?${query}`, {
    headers: requestHeaders(endpoint.anonKey),
  });

  if (!response.ok) {
    throw new Error("No se pudieron cargar los comentarios.");
  }

  const comments = await response.json();
  if (!Array.isArray(comments)) {
    throw new Error("El servicio devolvió una respuesta inesperada.");
  }

  commentList.replaceChildren(...comments.map(renderComment));
  setStatus(
    listStatus,
    comments.length
      ? `${comments.length} comentario${comments.length === 1 ? "" : "s"} aprobado${comments.length === 1 ? "" : "s"}.`
      : "Todavía no hay comentarios aprobados. ¡Puedes ser la primera persona en comentar!",
  );
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  let endpoint;
  try {
    endpoint = getCommentsEndpoint();
  } catch (error) {
    setStatus(formStatus, error.message, "error");
    return;
  }

  if (!endpoint) {
    setStatus(
      formStatus,
      "Los comentarios aún no están configurados. El administrador debe completar la conexión con Supabase.",
      "error",
    );
    return;
  }

  const formData = new FormData(form);
  const name = formData.get("name").trim();
  const message = formData.get("message").trim();

  if (!name || !message) {
    setStatus(formStatus, "Escribe tu nombre y un comentario antes de enviarlo.", "error");
    return;
  }

  submitButton.disabled = true;
  setStatus(formStatus, "Enviando tu comentario...");

  try {
    const response = await fetch(endpoint.url, {
      method: "POST",
      headers: requestHeaders(endpoint.anonKey, true),
      body: JSON.stringify({ name, message }),
    });

    if (!response.ok) {
      throw new Error("No se pudo enviar el comentario.");
    }

    form.reset();
    setStatus(
      formStatus,
      "¡Gracias! Tu comentario quedó pendiente de revisión antes de publicarse.",
      "success",
    );
  } catch {
    setStatus(
      formStatus,
      "No se pudo enviar tu comentario. Revisa tu conexión e inténtalo de nuevo.",
      "error",
    );
  } finally {
    submitButton.disabled = false;
  }
});

try {
  const endpoint = getCommentsEndpoint();

  if (endpoint) {
    setStatus(formStatus, "Tu comentario será revisado antes de publicarse.");
    setStatus(listStatus, "Cargando comentarios aprobados...");
    loadComments(endpoint).catch(() => {
      setStatus(
        listStatus,
        "No se pudieron cargar los comentarios. Intenta actualizar la página.",
        "error",
      );
    });
  } else {
    submitButton.disabled = true;
    setStatus(
      formStatus,
      "Los comentarios aún no están configurados. El administrador debe completar la conexión con Supabase.",
    );
    setStatus(listStatus, "Los comentarios aprobados aparecerán aquí cuando se configure el servicio.");
  }
} catch (error) {
  submitButton.disabled = true;
  setStatus(formStatus, error.message, "error");
  setStatus(listStatus, "No se pudieron cargar los comentarios.", "error");
}
