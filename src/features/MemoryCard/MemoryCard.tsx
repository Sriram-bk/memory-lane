import { TrashIcon, PencilIcon, EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import { ButtonText } from '../../designComponents/ButtonText';
import { Spinner } from '../../designComponents/Spinner';
import { Memory, useDeleteMemory } from '../../services/hooks';
import { useState, useRef, useEffect } from 'react';

interface MemoryCardProps {
    memory: Memory;
    onEdit?: (memory: Memory) => void;
    readOnly?: boolean;
}

export const MemoryCard = ({ memory, onEdit, readOnly }: MemoryCardProps) => {
    const { mutate: deleteMemory, isPending: isDeleting } = useDeleteMemory();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this memory?')) {
            deleteMemory(memory.id);
        }
        setIsMenuOpen(false);
    };

    const handleEdit = () => {
        onEdit?.(memory);
        setIsMenuOpen(false);
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">{memory.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {new Date(memory.timestamp).toLocaleDateString()}
                    </p>
                </div>
                {!readOnly && onEdit && (
                    <div className="relative" ref={menuRef}>
                        <ButtonText
                            size="small"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-neutral-600 hover:bg-neutral-50"
                        >
                            <EllipsisVerticalIcon className="h-5 w-5" />
                        </ButtonText>

                        {isMenuOpen && (
                            <div className="absolute right-0 mt-1 w-48 rounded-lg bg-white shadow-lg border border-neutral-200 py-1 z-10">
                                <button
                                    onClick={handleEdit}
                                    className="w-full px-4 py-2 text-left text-sm text-neutral-600 hover:bg-neutral-50 flex items-center space-x-2"
                                >
                                    <PencilIcon className="h-4 w-4 text-neutral-500" />
                                    <span>Edit</span>
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="w-full px-4 py-2 text-left text-sm text-neutral-600 hover:bg-neutral-50 flex items-center space-x-2 disabled:opacity-50"
                                >
                                    {isDeleting ? (
                                        <Spinner size="small" className="text-neutral-500" />
                                    ) : (
                                        <TrashIcon className="h-4 w-4 text-neutral-500" />
                                    )}
                                    <span>Delete</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <p className="mt-4 text-gray-700">{memory.description}</p>
            {memory.images && memory.images.length > 0 && (
                <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                    {memory.images.map((image) => (
                        <img
                            key={image.id}
                            src={image.url}
                            alt={memory.title}
                            className="h-32 w-32 object-cover rounded-lg flex-shrink-0"
                        />
                    ))}
                </div>
            )}
        </div>
    );
}; 