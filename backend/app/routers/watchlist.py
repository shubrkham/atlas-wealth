import uuid

from fastapi import APIRouter

from app.schemas.watchlist import WatchlistItemCreate

router = APIRouter(prefix="/watchlist", tags=["watchlist"])


@router.get("")
async def list_watchlist() -> dict:
    return {"items": [], "message": "List watchlist not implemented"}


@router.post("")
async def add_watchlist_item(payload: WatchlistItemCreate) -> dict:
    return {
        "message": "Add watchlist item not implemented",
        "data": payload.model_dump(),
    }


@router.delete("/{item_id}")
async def remove_watchlist_item(item_id: uuid.UUID) -> dict:
    return {
        "message": "Remove watchlist item not implemented",
        "item_id": str(item_id),
    }
