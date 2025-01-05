import { CubeIcon, PlusIcon, ShareIcon } from '@heroicons/react/20/solid'
import { useState } from 'react'
import { ButtonSolid } from '../designComponents/ButtonSolid'
import { Modal } from '../designComponents/Modal'
import { Spinner } from '../designComponents/Spinner'
import { AddMemoryForm } from '../features/AddMemoryForm/AddMemoryForm'
import { MemoryCard } from '../features/MemoryCard/MemoryCard'
import { Memory, useGetMemories } from '../services/hooks'
import { UpdateMemoryForm } from '../features/UpdateMemoryForm/UpdateMemoryForm'
import { useAuthContext } from '../features/Auth/AuthContext'
import { useShareToken } from '../services/hooks/useShareToken'
import { ButtonText } from '../designComponents/ButtonText'
import { ButtonOutline } from '../designComponents/ButtonOutline'

export function MemoryLanePage() {
    const [isAddingMemory, setIsAddingMemory] = useState(false);
    const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
    const { data: memoriesData, isLoading } = useGetMemories();
    const { logout } = useAuthContext();
    const [showShareToast, setShowShareToast] = useState(false);
    const { mutateAsync: getShareToken, isPending: isGettingShareToken } = useShareToken();

    const handleShare = async () => {
        try {
            const token = await getShareToken();
            const shareUrl = `${window.location.origin}/shared/${token}`;
            await navigator.clipboard.writeText(shareUrl);
            setShowShareToast(true);
            setTimeout(() => setShowShareToast(false), 2000);
        } catch (error) {
            console.error('Failed to get share token:', error);
        }
    };

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
                    <div className="flex items-center space-x-4">
                        <ButtonOutline
                            size="small"
                            onClick={handleShare}
                            disabled={isGettingShareToken}
                        >
                            {isGettingShareToken ? (
                                <>
                                    <Spinner size="small" />
                                    <span>Generating...</span>
                                </>
                            ) : (
                                <>
                                    <ShareIcon className="h-5 w-5" />
                                    <span>Share</span>
                                </>
                            )}
                        </ButtonOutline>
                        <ButtonSolid
                            size="small"
                            onClick={() => setIsAddingMemory(true)}
                        >
                            <PlusIcon className="h-5 w-5" />
                            <span>Add Memory</span>
                        </ButtonSolid>
                        <ButtonText size="small" className='text-red-800' onClick={logout}>
                            Logout
                        </ButtonText>
                    </div>
                </div>

                {/* Share Toast */}
                {showShareToast && (
                    <div className="fixed top-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg">
                        Share link copied to clipboard!
                    </div>
                )}

                <Modal
                    isOpen={isAddingMemory}
                    onClose={() => {
                        setIsAddingMemory(false);
                    }}
                    title="Add New Memory"
                >
                    <AddMemoryForm
                        onCancel={() => {
                            setIsAddingMemory(false);
                        }}
                        onSuccess={() => {
                            setIsAddingMemory(false);
                        }}
                    />
                </Modal>

                <Modal
                    isOpen={editingMemory !== null}
                    onClose={() => setEditingMemory(null)}
                    title="Edit Memory"
                >
                    {editingMemory && (
                        <UpdateMemoryForm
                            memory={editingMemory}
                            onCancel={() => setEditingMemory(null)}
                            onSuccess={() => setEditingMemory(null)}
                        />
                    )}
                </Modal>

                <div className="mt-8">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Spinner size="large" className="text-amber-600" />
                        </div>
                    ) : memoriesData?.memories.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No memories yet. Add your first memory!</p>
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
                                                onEdit={setEditingMemory}
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