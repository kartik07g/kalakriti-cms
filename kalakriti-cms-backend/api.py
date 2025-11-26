from fastapi import FastAPI
# from config import settings
from fastapi.middleware.cors import CORSMiddleware
from Resources.User import user_router
from Resources.EventRegistration import event_registration_router
from Resources.Assets import asset_router
from Resources.Results import result_router
from Resources.ContactUs import contact_us_router
from Resources.Events import event_router


# Create FastAPI app instance
app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Healthcheck endpoint
@app.get("/backend/healthcheck")
def read_root():
    return {"status": "ok"}

# @app.get("/frontend-url")
# def get_frontend_url():
#     return {"frontend_url": settings.frontend_url}

# @app.get("/backend-env")
# def get_backend_env():
#     return {"backend_env": settings.backend_env}

app.include_router(user_router)
app.include_router(event_registration_router)
app.include_router(asset_router)
app.include_router(result_router)
app.include_router(contact_us_router)
app.include_router(event_router)

