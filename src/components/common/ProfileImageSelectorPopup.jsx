import { X } from 'lucide-react';
import { PROFILE_ASSETS } from '../../constants/assets';

// Tier hierarchy to determine which icons are selectable
const TIER_HIERARCHY = {
  PAWN: 0,
  KNIGHT: 1,
  BISHOP: 2,
  ROOK: 3,
  QUEEN: 4,
  KING: 5,
};

export default function ProfileImageSelectorPopup({
  isOpen,
  onClose,
  currentImageCode,
  onSelect,
  maxTier = 'PAWN', // Default to PAWN (Beginner) tier restrictions 
}) {
  if (!isOpen) return null;

  const maxAllowedLevel = TIER_HIERARCHY[maxTier] ?? 0;

  // Filter assets based on the user's max tier
  const filteredAssets = PROFILE_ASSETS.filter((asset) => {
    // Determine the tier of the asset based on its ID keyword
    let assetTierLevel = 0; // Default to PAWN equivalents
    
    if (asset.id.includes('KING')) assetTierLevel = TIER_HIERARCHY.KING;
    else if (asset.id.includes('QUEEN')) assetTierLevel = TIER_HIERARCHY.QUEEN;
    else if (asset.id.includes('ROOK')) assetTierLevel = TIER_HIERARCHY.ROOK;
    else if (asset.id.includes('BISHOP')) assetTierLevel = TIER_HIERARCHY.BISHOP;
    else if (asset.id.includes('KNIGHT')) assetTierLevel = TIER_HIERARCHY.KNIGHT;
    
    // Only return assets that are less than or equal to the character's max allowed tier
    return assetTierLevel <= maxAllowedLevel;
  });

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-bg-main w-[90%] max-w-[360px] mx-auto rounded-2xl shadow-lg overflow-hidden flex flex-col h-[65vh] max-h-[600px] border border-text-main/10 animate-scale-in">
        {/* Header */}
        <div className="px-4 h-14 border-b border-text-main/10 flex items-center justify-between shrink-0 bg-neutral-900/50 relative text-center">
          <div className="min-w-[40px]" />
          <h2 className="text-base font-bold text-text-main">
            프로필 선택
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-text-sub hover:text-text-main rounded-full transition-colors min-w-[40px]"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Search List */}
        <div className="flex-1 min-h-0 bg-bg-main overflow-y-auto p-6 custom-scrollbar">
          <div className="grid grid-cols-3 gap-5 place-items-center">
            {filteredAssets.map((asset) => (
              <button
                type="button"
                key={asset.id}
                onClick={() => onSelect(asset.id)}
                className={`group relative w-20 h-20 rounded-full overflow-hidden border-2 transition-all flex items-center justify-center ${
                  currentImageCode === asset.id
                    ? 'border-primary-500'
                    : 'border-text-main/10 hover:border-neutral-600'
                }`}
                style={{ backgroundColor: asset.bg || 'transparent' }}
              >
                <div
                  className="w-full h-full flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
                  style={{ padding: asset.padding || '0px' }}
                >
                  <img
                    src={asset.path}
                    alt={asset.id}
                    className="w-full h-full object-contain object-center"
                    style={{ transform: `scale(${asset.scale || 1})` }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}
