import { Search } from 'lucide-react';
import Input from './Input';

export default function SearchBar({
  value,
  onChange,
  placeholder = '링크 또는 폴더 검색',
  className = '',
  mb = 'mb-2',
  type = 'text',
  ...rest
}) {
  const handleClear = () => {
    onChange({ target: { value: '', name: 'search' } });
  };

  return (
    <div className={`w-full ${mb} ${className}`}>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onClear={handleClear}
        leftIcon={<Search className="w-5 h-5 text-text-disabled" />}
        {...rest}
      />
    </div>
  );
}
