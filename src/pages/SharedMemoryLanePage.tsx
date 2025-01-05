import { CubeIcon } from '@heroicons/react/20/solid'
import { Spinner } from '../designComponents/Spinner'
import { MemoryCard } from '../features/MemoryCard/MemoryCard'
import { useGetMemories } from '../services/hooks'
import { useParams } from 'react-router-dom'

export function SharedMemoryLanePage() {
    const { token } = useParams();
    const { data: memoriesData, isLoading, error } = useGetMemories(token);

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Share Link</h1>
                    <p className="text-gray-500">This share link is invalid or has expired.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center'>
                        <CubeIcon className='h-12 w-12 text-amber-600' />
                        <h1 className='text-3xl font-bold text-gray-900 ml-4'>
                            Memory Lane
                        </h1>
                    </div>
                </div>

                <div className="mt-8">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Spinner size="large" className="text-amber-600" />
                        </div>
                    ) : memoriesData?.memories.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No memories to display.</p>
                        </div>
                    ) : (
                        <div className="relative pl-8">
                            {/* Timeline line */}
                            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-neutral-200" />

                            <div className="space-y-12">
                                {memoriesData?.memories.map((memory) => (
                                    <div key={memory.id} className="flex items-start">
                                        {/* Timeline dot */}
                                        <div className="absolute left-0 w-4 h-4 rounded-full bg-amber-600 border-4 border-white shadow -translate-x-[7px] mt-6" />

                                        {/* Content */}
                                        <div className="flex-1">
                                            <MemoryCard
                                                memory={memory}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 