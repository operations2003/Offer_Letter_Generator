import React from 'react';

interface TaskNeraBrandLogoProps {
  iconSize?: number;
  showTagline?: boolean;
  taglineFontSize?: number;
  titleFontSize?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const TaskNeraBrandLogo: React.FC<TaskNeraBrandLogoProps> = ({
  iconSize = 44,
  showTagline = true,
  taglineFontSize = 10,
  titleFontSize = 24,
  className = '',
  style = {},
}) => {
  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: Math.max(8, Math.round(iconSize * 0.28)),
        ...style,
      }}
    >
      <img
        src="/logo.png"
        alt="TaskNera"
        style={{
          width: iconSize,
          height: iconSize,
          objectFit: 'contain',
          flexShrink: 0,
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div
          style={{
            fontSize: titleFontSize,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          <span style={{ color: '#252c38' }}>Task</span>
          <span style={{ color: '#f56637' }}>Nera</span>
        </div>
        {showTagline && (
          <div
            style={{
              fontSize: taglineFontSize,
              fontWeight: 500,
              color: '#334155',
              letterSpacing: '0.01em',
              marginTop: 2,
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            People. Processes. Performance.
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskNeraBrandLogo;
