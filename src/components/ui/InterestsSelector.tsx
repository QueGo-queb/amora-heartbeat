import React from 'react';
import Select from 'react-select';

interface Interest {
  value: string;
  label: string;
  icon: string;
}

interface InterestsSelectorProps {
  selectedInterests: string[];
  setSelectedInterests: (interests: string[]) => void;
}

const interests: Interest[] = [
  { value: "listening-music", label: "Listening Music", icon: "🎵" },
  { value: "books", label: "Books", icon: "📚" },
  { value: "parties", label: "Parties", icon: "🍸" },
  { value: "self-care", label: "Self Care", icon: "🧖‍♀️" },
  { value: "message", label: "Message", icon: "✉️" },
  { value: "hot-yoga", label: "Hot Yoga", icon: "🧘‍♂️" },
  { value: "gymnastics", label: "Gymnastics", icon: "🤸" },
  { value: "hockey", label: "Hockey", icon: "🏒" },
  { value: "football", label: "Football", icon: "⚽" },
  { value: "meditation", label: "Meditation", icon: "🧘" },
  { value: "spotify", label: "Spotify", icon: "🎧" },
  { value: "sushi", label: "Sushi", icon: "🍣" },
  { value: "painting", label: "Painting", icon: "🎨" },
  { value: "basketball", label: "Basketball", icon: "🏀" },
  { value: "theater", label: "Theater", icon: "🎭" },
  { value: "playing-music-instrument", label: "Playing Music Instrument", icon: "🎸" },
  { value: "aquarium", label: "Aquarium", icon: "🐠" },
  { value: "fitness", label: "Fitness", icon: "🏋️" },
  { value: "travel", label: "Travel", icon: "✈️" },
  { value: "coffee", label: "Coffee", icon: "☕" },
  { value: "instagram", label: "Instagram", icon: "📸" },
  { value: "walking", label: "Walking", icon: "🚶" },
  { value: "running", label: "Running", icon: "🏃" },
  { value: "church", label: "Church", icon: "⛪" },
  { value: "cooking", label: "Cooking", icon: "🍳" },
  { value: "singing", label: "Singing", icon: "🎤" }
];

const InterestsSelector: React.FC<InterestsSelectorProps> = ({ 
  selectedInterests, 
  setSelectedInterests 
}) => {
  const handleChange = (selectedOptions: any) => {
    const values = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
    setSelectedInterests(values);
  };

  const getSelectedOptions = () => {
    return interests.filter(interest => selectedInterests.includes(interest.value));
  };

  const customOptionLabel = ({ label, icon }: Interest) => (
    <div className="flex items-center gap-2">
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </div>
  );

  const customMultiValueLabel = ({ data }: any) => (
    <div className="flex items-center gap-1">
      <span className="text-sm">{data.icon}</span>
      <span className="text-sm">{data.label}</span>
    </div>
  );

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white">
        Intérêts et passions
      </label>
      <Select
        isMulti
        options={interests}
        value={getSelectedOptions()}
        onChange={handleChange}
        formatOptionLabel={customOptionLabel}
        formatMultiValueLabel={customMultiValueLabel}
        placeholder="Sélectionnez vos intérêts..."
        className="text-black"
        classNamePrefix="react-select"
        styles={{
          control: (provided) => ({
            ...provided,
            backgroundColor: '#1e293b', // bg-slate-800
            borderColor: '#475569', // border-slate-600
            '&:hover': {
              borderColor: '#64748b' // border-slate-500
            }
          }),
          menu: (provided) => ({
            ...provided,
            backgroundColor: '#1e293b', // bg-slate-800
            border: '1px solid #475569' // border-slate-600
          }),
          option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isFocused ? '#334155' : '#1e293b', // bg-slate-700 ou bg-slate-800
            color: 'white',
            '&:hover': {
              backgroundColor: '#334155' // bg-slate-700
            }
          }),
          multiValue: (provided) => ({
            ...provided,
            backgroundColor: '#475569', // bg-slate-600
            color: 'white'
          }),
          multiValueLabel: (provided) => ({
            ...provided,
            color: 'white'
          }),
          multiValueRemove: (provided) => ({
            ...provided,
            color: 'white',
            '&:hover': {
              backgroundColor: '#64748b', // bg-slate-500
              color: 'white'
            }
          }),
          placeholder: (provided) => ({
            ...provided,
            color: '#94a3b8' // text-slate-400
          }),
          input: (provided) => ({
            ...provided,
            color: 'white'
          })
        }}
      />
    </div>
  );
};

export default InterestsSelector;
