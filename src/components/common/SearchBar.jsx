import { Search } from 'lucide-react';
import Input from './Input';

export default function SearchBar({ value, onChange }) {
  return (
    <div className="w-full">
      <Input
        type="search"
        placeholder="링크 또는 폴더 검색"
        value={value}
        onChange={onChange}
        leftIcon={<Search className="w-5 h-5 text-text-disabled" />}
      />
    </div>
  );
}
