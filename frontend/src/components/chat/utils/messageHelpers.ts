// Check if message is an image/GIF
export const isImageMessage = (text: string): boolean => {
  return Boolean(
    text.match(/\.(gif|jpe?g|png|webp)(\?|$)/i) || 
    text.startsWith('https://media.tenor.com') || 
    text.startsWith('https://res.cloudinary.com')
  );
};

// Check if message is a position share system message
export const isPositionShare = (metadata: any): boolean => {
  return metadata?.type === 'position_share';
};

// Extract mentions from message text
export const extractMentions = (text: string): string[] => {
  return text.match(/@(\w+)/g)?.map(m => m.substring(1)) || [];
};
