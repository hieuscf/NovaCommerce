from contextlib import asynccontextmanager

from fastapi import FastAPI


@asynccontextmanager
async def lifespan(_: FastAPI):
    yield


app = FastAPI(title="NovaCommerce AI Service", lifespan=lifespan)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "ai-api"}


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "NovaCommerce AI Service"}
