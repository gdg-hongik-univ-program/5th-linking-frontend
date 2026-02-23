import { X } from 'lucide-react';
import { PROFILE_ASSETS } from '../../constants/assets';

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
  maxTier = 'PAWN',
}) {
  if (!isOpen) return null;

  const maxAllowedLevel = TIER_HIERARCHY[maxTier] ?? 0;

  const filteredAssets = PROFILE_ASSETS.filter((asset) => {
    let assetTierLevel = 0;

    if (asset.id.includes('KING')) assetTierLevel = TIER_HIERARCHY.KING;
    else if (asset.id.includes('QUEEN')) assetTierLevel = TIER_HIERARCHY.QUEEN;
    else if (asset.id.includes('ROOK')) assetTierLevel = TIER_HIERARCHY.ROOK;
    else if (asset.id.includes('BISHOP'))
      assetTierLevel = TIER_HIERARCHY.BISHOP;
    else if (asset.id.includes('KNIGHT'))
      assetTierLevel = TIER_HIERARCHY.KNIGHT;

    return assetTierLevel <= maxAllowedLevel;
  });

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4 isolate">
      <div className="absolute inset-0 bg-black/50 pointer-events-auto" />

      <div className="relative bg-bg-main w-full max-w-[340px] rounded-2xl shadow-lg overflow-hidden flex flex-col h-[65vh] max-h-[600px] border border-text-main/10 pointer-events-auto">
        <div className="px-4 h-14 border-b border-text-main/10 flex items-center justify-between shrink-0 bg-bg-main relative">
          <div className="flex items-center justify-start min-w-[40px]">
            <button
              onClick={onClose}
              className="p-2 -ml-2 text-text-sub hover:text-text-main rounded-full active:bg-neutral-800 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none w-[180px]">
            <h2 className="text-base font-bold text-text-main truncate">
              프로필 선택
            </h2>
          </div>

          <div className="flex items-center justify-end min-w-[40px]" />
        </div>

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
