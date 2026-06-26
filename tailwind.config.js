/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ===== 设计图粉紫系配色 =====
        // 粉色系（用于"调得很好"、主色调）
        dpink: {
          50: '#FFF0F5',
          100: '#FFE0EC',
          200: '#FFB6C1',   // 设计图主粉色
          300: '#FF8FA3',
          400: '#FF6B9A',   // 设计文档主色
          500: '#FF3D7A',
          600: '#E81E5E',
        },
        // 紫色系（用于"还需要努力"、辅助色）
        dpurple: {
          50: '#F5F0FF',
          100: '#EDE5FF',
          200: '#C4B0FF',
          300: '#A78BFA',
          400: '#8E7DFE',   // 设计图主紫色
          500: '#7C3AED',
          600: '#6D28D9',
        },
        // 成功/绿色
        dgreen: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          400: '#22C55E',
          500: '#16A34A',
        },
        dbg: '#FAFAFE',     // 背景色
      },
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto',
          '"PingFang SC"', '"Microsoft YaHei"', '"Helvetica Neue"', 'Arial',
          '"Noto Sans SC"', 'sans-serif'
        ],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
