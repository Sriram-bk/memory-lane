import { CubeIcon, PlusIcon } from '@heroicons/react/20/solid'
import { useState } from 'react'
import { ButtonSolid } from '../designComponents/ButtonSolid'
import { Modal } from '../designComponents/Modal'
import { Spinner } from '../designComponents/Spinner'
import { AddMemoryForm } from '../features/AddMemoryForm/AddMemoryForm'
import { MemoryCard } from '../features/MemoryCard/MemoryCard'
import { Memory, useGetMemories } from '../services/hooks'
import { UpdateMemoryForm } from '../features/UpdateMemoryForm/UpdateMemoryForm'
import { useAuthContext } from '../features/Auth/AuthContext'

export function MemoryLanePage() {
    const [isAddingMemory, setIsAddingMemory] = useState(false);
    const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
    const { data: memoriesData, isLoading } = useGetMemories();
    const { logout } = useAuthContext();

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
                        <ButtonSolid
                            onClick={() => setIsAddingMemory(true)}
                        >
                            <PlusIcon className="h-5 w-5" />
                            <span>Add Memory</span>
                        </ButtonSolid>
                        <ButtonSolid onClick={logout}>
                            Logout
                        </ButtonSolid>
                    </div>
                </div>

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