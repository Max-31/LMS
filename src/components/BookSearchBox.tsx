
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { genreOptions } from "@/lib/data";

type SearchFilters = {
  query: string;
  author: string;
  genre: string;
};

type BookSearchBoxProps = {
  onSearch: (filters: SearchFilters) => void;
};

const BookSearchBox = ({ onSearch }: BookSearchBoxProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    author: "",
    genre: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenreChange = (value: string) => {
    setFilters((prev) => ({ ...prev, genre: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  return (
    <form onSubmit={handleSearch} className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex items-center mb-4 relative">
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          name="query"
          placeholder="Search by title..."
          value={filters.query}
          onChange={handleInputChange}
          className="pl-10"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        <div>
          <Input
            type="text"
            name="author"
            placeholder="Author"
            value={filters.author}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <Select 
            value={filters.genre} 
            onValueChange={handleGenreChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Genre" />
            </SelectTrigger>
            <SelectContent>
              {/* Add an "All Genres" option with a non-empty value */}
              <SelectItem value="all">All Genres</SelectItem>
              {genreOptions.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value || "unknown"} // Ensure no empty string values
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2 lg:col-span-1">
          <Button type="submit" className="w-full">
            Search
          </Button>
        </div>
      </div>
    </form>
  );
};

export default BookSearchBox;
