import { useState } from 'react';
import { useNotificationStore } from '../../../stores/notificationStore';
import { marketPositionService, polymarketService, marketStatusService } from '../../../services/api';

interface UseMarketStatusProps {
  conversationType: string;
  marketId?: string;
  initialMarketPositions?: Record<string, 'yes' | 'no'>;
  initialWhales?: Record<string, boolean>;
  onMarketPositionsUpdate?: (positions: Record<string, 'yes' | 'no'>) => void;
  onWhalesUpdate?: (whales: Record<string, boolean>) => void;
}

export const useMarketStatus = ({ 
  conversationType, 
  marketId,
  onMarketPositionsUpdate,
  onWhalesUpdate,
}: UseMarketStatusProps) => {
  const { addNotification } = useNotificationStore();
  
  const [myMarketStatus, setMyMarketStatus] = useState<'position' | 'whale' | null>(null);
  const [myPositionSizeUSD, setMyPositionSizeUSD] = useState<number>(0);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [showPositionModal, setShowPositionModal] = useState(false);
  
  // Handle "Show my position" button click (user opt-in)
  const handleShowMyPosition = async () => {
    if (conversationType !== 'market' || !marketId) return;
    if (isLoadingStatus) return;

    setIsLoadingStatus(true);
    
    try {
      const result = await marketStatusService.computeMyStatus(marketId);
      
      if (!result.success) {
        if (result.rateLimited) {
          const minutes = Math.ceil((result.timeUntilReset || 0) / 60);
          addNotification({
            type: 'system',
            title: 'Rate Limit',
            message: `Please wait ${minutes} minute${minutes !== 1 ? 's' : ''} before refreshing status again.`,
          });
          return;
        }
        
        addNotification({
          type: 'system',
          title: 'Error',
          message: result.message || 'Failed to compute market status',
        });
        return;
      }

      setMyMarketStatus(result.status || null);
      setMyPositionSizeUSD(result.positionSizeUSD || 0);
      
      console.log('✓ Market status computed:', {
        status: result.status,
        isWhale: result.isWhale,
        positionSizeUSD: result.positionSizeUSD,
      });
      
      // Only show modal if position value is greater than 0
      if (result.positionSizeUSD && result.positionSizeUSD > 0) {
        setShowPositionModal(true);
      }

      // Load all positions for this market
      const positionsResult = await marketPositionService.getMarketPositions(marketId);
      const positionsMap: Record<string, 'yes' | 'no'> = {};
      const activeUserIds: string[] = [];
      
      positionsResult.positions.forEach((pos) => {
        const userId = pos.user_id._id || pos.user_id;
        positionsMap[userId] = pos.position;
        activeUserIds.push(userId);
      });
      
      if (onMarketPositionsUpdate) {
        onMarketPositionsUpdate(positionsMap);
      }

      // Load whale data
      if (activeUserIds.length > 0) {
        const whalesResult = await polymarketService.getMarketWhales(marketId, activeUserIds);
        if (onWhalesUpdate) {
          onWhalesUpdate(whalesResult.whales);
        }
      }
    } catch (error) {
      console.error('Failed to load market status:', error);
      addNotification({
        type: 'system',
        title: 'Error',
        message: 'Failed to load market status. Please try again.',
      });
    } finally {
      setIsLoadingStatus(false);
    }
  };
  
  return {
    myMarketStatus,
    myPositionSizeUSD,
    isLoadingStatus,
    showPositionModal,
    setShowPositionModal,
    handleShowMyPosition,
  };
};
