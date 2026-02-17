import { Search } from 'lucide-react';
import Input from './Input';

export default function SearchBar({
  value,
  onChange,
  placeholder = '링크 또는 폴더 검색',
  className = '',
  mb = 'mb-6', // 기본값 유지
}) {
  return (
    <div className={`w-full ${mb} ${className}`}>
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        leftIcon={<Search className="w-5 h-5 text-text-disabled" />}
      />
    </div>
  );
}
