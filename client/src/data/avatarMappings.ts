// Avatar mappings for AI SME experts
// Maps expert IDs to their generated avatar paths

export const avatarMappings: Record<string, string> = {
  // Investment & Finance
  'victor-sterling': '/avatars/victor-sterling.png',
  'marcus-macro': '/avatars/marcus-macro.png',
  'sophia-venture': '/avatars/sophia-venture.png',
  'grace-family': '/avatars/grace-family.png',
  'warren-value': '/avatars/warren-value.png',
  'ray-dalio': '/avatars/ray-dalio.png',
  
  // Technology & AI
  'jensen-ai': '/avatars/jensen-ai.png',
  'andrew-ml': '/avatars/andrew-ml.png',
  'satya-cloud': '/avatars/satya-cloud.png',
  'sundar-cloud': '/avatars/sundar-cloud.png',
  'elon-tech': '/avatars/elon-tech.png',
  'peter-thiel': '/avatars/peter-thiel.png',
  
  // Strategy & Leadership
  'alexandra-strategy': '/avatars/alexandra-strategy.png',
  'aurora-disrupt': '/avatars/aurora-disrupt.png',
  'richard-growth': '/avatars/richard-growth.png',
  
  // Design & Creative
  'franz-precision': '/avatars/franz-precision.png',
  'alessandro-luxe': '/avatars/alessandro-luxe.png',
  'maya-ux': '/avatars/maya-ux.png',
  'elena-brand': '/avatars/elena-brand.png',
  
  // Operations & Corporate
  'indra-operations': '/avatars/indra-operations.png',
  'jeff-logistics': '/avatars/jeff-logistics.png',
  'david-product': '/avatars/david-product.png',
  'carlos-sales': '/avatars/carlos-sales.png',
  'sarah-hr': '/avatars/sarah-hr.png',
  'michael-legal': '/avatars/michael-legal.png',
  'maxwell-patent': '/avatars/maxwell-patent.png',
  
  // Psychology & Behavioral
  'emma-thaler': '/avatars/emma-thaler.png',
  
  // Celebrities
  'jay-z': '/avatars/jay-z.png',
  'oprah-media': '/avatars/oprah-media.png',
  'ryan-reynolds': '/avatars/ryan-reynolds.png',
};

// Helper function to get avatar URL with fallback
export function getAvatarUrl(expertId: string, fallbackUrl?: string): string {
  const mappedAvatar = avatarMappings[expertId.toLowerCase().replace(/\s+/g, '-')];
  if (mappedAvatar) {
    return mappedAvatar;
  }
  return fallbackUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${expertId}`;
}
