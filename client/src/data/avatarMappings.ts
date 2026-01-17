// Avatar mappings for AI SME experts
// Maps expert IDs to their generated avatar paths

export const avatarMappings: Record<string, string> = {
  // Investment & Finance
  'victor-sterling': '/avatars/victor-sterling.jpg',
  'marcus-macro': '/avatars/marcus-macro.jpg',
  'sophia-venture': '/avatars/sophia-venture.jpg',
  'grace-family': '/avatars/grace-family.jpg',
  'warren-value': '/avatars/warren-value.jpg',
  'ray-dalio': '/avatars/ray-dalio.jpg',
  
  // Technology & AI
  'jensen-ai': '/avatars/jensen-ai.jpg',
  'andrew-ml': '/avatars/andrew-ml.jpg',
  'satya-cloud': '/avatars/satya-cloud.jpg',
  'sundar-cloud': '/avatars/sundar-cloud.jpg',
  'elon-tech': '/avatars/elon-tech.jpg',
  'peter-thiel': '/avatars/peter-thiel.jpg',
  
  // Strategy & Leadership
  'alexandra-strategy': '/avatars/alexandra-strategy.jpg',
  'aurora-disrupt': '/avatars/aurora-disrupt.jpg',
  'richard-growth': '/avatars/richard-growth.jpg',
  
  // Design & Creative
  'franz-precision': '/avatars/franz-precision.jpg',
  'alessandro-luxe': '/avatars/alessandro-luxe.jpg',
  'maya-ux': '/avatars/maya-ux.jpg',
  'elena-brand': '/avatars/elena-brand.jpg',
  
  // Operations & Corporate
  'indra-operations': '/avatars/indra-operations.jpg',
  'jeff-logistics': '/avatars/jeff-logistics.jpg',
  'david-product': '/avatars/david-product.jpg',
  'carlos-sales': '/avatars/carlos-sales.jpg',
  'sarah-hr': '/avatars/sarah-hr.jpg',
  'michael-legal': '/avatars/michael-legal.jpg',
  'maxwell-patent': '/avatars/maxwell-patent.jpg',
  
  // Psychology & Behavioral
  'emma-thaler': '/avatars/emma-thaler.jpg',
  
  // Celebrities
  'jay-z': '/avatars/jay-z.jpg',
  'oprah-media': '/avatars/oprah-media.jpg',
  'ryan-reynolds': '/avatars/ryan-reynolds.jpg',
};

// Helper function to get avatar URL with fallback
export function getAvatarUrl(expertId: string, fallbackUrl?: string): string {
  const mappedAvatar = avatarMappings[expertId.toLowerCase().replace(/\s+/g, '-')];
  if (mappedAvatar) {
    return mappedAvatar;
  }
  return fallbackUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${expertId}`;
}
