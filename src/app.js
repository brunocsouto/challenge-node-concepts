const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function validateRepositoryFields(request, response, next) {
  const { title, url, techs } = request.body;

  if (!title || !url || !techs) {
    return response.status(400).json({ error: "Missing fields" });
  }

  return next();
}

function validateRepositoryId(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id)) {
    return response.status(400).json({ error: "Invalid Id" });
  }

  return next();
}

app.get("/repositories", (request, response) => {
  return response.send(repositories);
});

app.post("/repositories", validateRepositoryFields, (request, response) => {
  const { title, url, techs } = request.body;

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0,
  };

  repositories.push(repository);

  return response.status(200).json(repository);
});

app.put("/repositories/:id", validateRepositoryId, (request, response) => {
  const { id } = request.params;
  const { url, title, techs } = request.body;

  const repositoryIndex = repositories.findIndex(
    (repository) => repository.id === id
  );

  if (repositoryIndex < 0) {
    return response.status(400).json({ error: "Repository not found." });
  }

  const { likes } = repositories[repositoryIndex];

  const repository = {
    id,
    url,
    title,
    techs,
    likes,
  };

  repositories[repositoryIndex] = repository;

  return response.status(200).send(repository);
});

app.delete("/repositories/:id", validateRepositoryId, (request, response) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(
    (repository) => repository.id === id
  );

  repositories.splice(repositoryIndex, 1);

  return response.status(204).send();
});

app.post(
  "/repositories/:id/like",
  validateRepositoryId,
  (request, response) => {
    const { id } = request.params;

    const repositoryIndex = repositories.findIndex(
      (repository) => repository.id === id
    );

    const repository = repositories[repositoryIndex];
    repository.likes++;

    const { likes } = repository;

    return response.status(200).send({ likes });
  }
);

module.exports = app;
