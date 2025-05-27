import asyncio
from typing import AsyncGenerator, Dict, Set

class PubSubManager:
    """
    Simple Pub/Sub manager for async events and real-time streaming
    Enables token streaming for AI-generated todo suggestions
    """

    def __init__(self):
        # Store active channels as {channel_id: Queue}
        self.channels: Dict[str, asyncio.Queue] = {}
        # Store active subscriptions as {channel_id: set(subscription_ids)}
        self.subscribers: Dict[str, Set[int]] = {}
        # Counter for generating unique subscription IDs
        self.next_sub_id: int = 1

    async def publish(self, channel_id: str, message: str) -> bool:
        """
        Publish a message to a channel
        Creates the channel if it doesn't exist
        """
        if channel_id not in self.channels:
            self.channels[channel_id] = asyncio.Queue()
            self.subscribers[channel_id] = set()
        
        await self.channels[channel_id].put(message)
        return True

    async def subscribe(self, channel_id: str) -> AsyncGenerator[str, None]:
        """
        Subscribe to a channel and yield messages as they arrive
        Creates the channel if it doesn't exist
        """
        # Create channel if it doesn't exist
        if channel_id not in self.channels:
            self.channels[channel_id] = asyncio.Queue()
            self.subscribers[channel_id] = set()
        
        # Generate a unique subscription ID
        sub_id = self._get_next_sub_id()
        self.subscribers[channel_id].add(sub_id)
        
        try:
            # Continue yielding messages until channel is closed
            while True:
                message = await self.channels[channel_id].get()
                
                # Special EOF marker
                if message is None:
                    break
                    
                yield message
                
                # Mark the task as done
                self.channels[channel_id].task_done()
        finally:
            # Clean up subscription when generator is closed
            if channel_id in self.subscribers and sub_id in self.subscribers[channel_id]:
                self.subscribers[channel_id].remove(sub_id)
                
            # Remove channel if no more subscribers
            await self._cleanup_channel(channel_id)

    async def close_channel(self, channel_id: str) -> bool:
        """
        Close a channel and signal end to all subscribers
        """
        if channel_id not in self.channels:
            return False
            
        # Put None as an EOF marker for all active subscribers
        for _ in range(len(self.subscribers.get(channel_id, set()))):
            await self.channels[channel_id].put(None)
            
        # Cleanup will happen when subscribers process the EOF
        return True

    async def _cleanup_channel(self, channel_id: str) -> None:
        """
        Remove a channel if it has no subscribers
        """
        if channel_id in self.subscribers and not self.subscribers[channel_id]:
            # No more subscribers, clean up
            if channel_id in self.channels:
                del self.channels[channel_id]
            del self.subscribers[channel_id]

    def _get_next_sub_id(self) -> int:
        """Get next unique subscription ID"""
        sub_id = self.next_sub_id
        self.next_sub_id += 1
        return sub_id