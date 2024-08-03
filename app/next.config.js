/** @type {import('next').NextConfig} */
const nextConfig = {
  // https://stackoverflow.com/questions/66244968/cannot-use-import-statement-outside-a-module-error-when-importing-react-hook-m
  transpilePackages: [
    'antd',
    'rc-util',
    '@babel/runtime',
    '@ant-design/icons',
    '@ant-design/icons-svg',
    'rc-pagination',
    'rc-picker',
    'rc-tree',
    'rc-table',
  ],
};

module.exports = nextConfig;
