import './LoadingSkeleton.css';

interface LoadingSkeletonProps {
  type: 'chat-card' | 'message' | 'profile' | 'leaderboard-item';
  count?: number;
}

export const LoadingSkeleton = ({ type, count = 1 }: LoadingSkeletonProps) => {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  if (type === 'chat-card') {
    return (
      <>
        {skeletons.map((i) => (
          <div
            key={i}
            className="skeleton-chat-card"
            style={{
              width: '100%',
              height: '140px',
              backgroundColor: '#19191A',
              border: '1px solid transparent',
              backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              borderRadius: '20px',
              padding: '15px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {/* Top section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="skeleton-shimmer" style={{ width: '60px', height: '12px', borderRadius: '6px' }} />
              <div className="skeleton-shimmer" style={{ width: '100px', height: '14px', borderRadius: '7px' }} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <div className="skeleton-shimmer" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                <div className="skeleton-shimmer" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
              </div>
            </div>
            {/* Bottom section */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div className="skeleton-shimmer" style={{ width: '35px', height: '35px', borderRadius: '50%' }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton-shimmer" style={{ width: '70%', height: '12px', borderRadius: '6px', marginBottom: '6px' }} />
                <div className="skeleton-shimmer" style={{ width: '90%', height: '10px', borderRadius: '5px' }} />
              </div>
            </div>
          </div>
        ))}
      </>
    );
  }

  if (type === 'message') {
    return (
      <>
        {skeletons.map((i) => (
          <div key={i} style={{ width: '100%', padding: '10px 0' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
              <div className="skeleton-shimmer" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
              <div style={{ flex: 1, maxWidth: '70%' }}>
                <div className="skeleton-shimmer" style={{ width: '80px', height: '10px', borderRadius: '5px', marginBottom: '6px' }} />
                <div className="skeleton-shimmer" style={{ width: '100%', height: '60px', borderRadius: '20px' }} />
              </div>
            </div>
          </div>
        ))}
      </>
    );
  }

  if (type === 'profile') {
    return (
      <div style={{ width: '100%', padding: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          <div className="skeleton-shimmer" style={{ width: '100px', height: '100px', borderRadius: '50%' }} />
          <div className="skeleton-shimmer" style={{ width: '150px', height: '16px', borderRadius: '8px' }} />
          <div className="skeleton-shimmer" style={{ width: '200px', height: '12px', borderRadius: '6px' }} />
          <div className="skeleton-shimmer" style={{ width: '100%', height: '80px', borderRadius: '15px', marginTop: '10px' }} />
        </div>
      </div>
    );
  }

  if (type === 'leaderboard-item') {
    return (
      <>
        {skeletons.map((i) => (
          <div
            key={i}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              padding: '10px 0',
              borderBottom: i < count - 1 ? '1px solid #333333' : 'none',
            }}
          >
            <div className="skeleton-shimmer" style={{ width: '40px', height: '20px', borderRadius: '10px' }} />
            <div className="skeleton-shimmer" style={{ width: '60px', height: '60px', borderRadius: '50%' }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton-shimmer" style={{ width: '120px', height: '14px', borderRadius: '7px', marginBottom: '6px' }} />
              <div className="skeleton-shimmer" style={{ width: '80px', height: '10px', borderRadius: '5px' }} />
            </div>
            <div className="skeleton-shimmer" style={{ width: '60px', height: '14px', borderRadius: '7px' }} />
          </div>
        ))}
      </>
    );
  }

  return null;
};

