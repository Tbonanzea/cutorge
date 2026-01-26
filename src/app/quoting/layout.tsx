'use client';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
	QuotingProvider,
	useCurrentStep,
	useQuoting,
} from '@/context/quotingContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function QuotingHeader() {
	const {
		nextStep,
		prevStep,
		canProceed,
		goToStep,
		currentStep: stepNumber,
		steps,
	} = useQuoting();
	const { progress, isFirst, isLast } = useCurrentStep();

	return (
		<div className='bg-white border-b mx-auto p-6'>
			<h1 className='text-3xl font-bold text-center mb-2'>
				Cotizador CutForge
			</h1>
			<div className='flex self-center justify-center items-center'>
				<div className='mb-6 min-w-4xl'>
					<div className='flex justify-between items-center mb-2'>
						<span className='text-sm font-medium text-gray-700'>
							Paso {stepNumber + 1} de {steps.length}
						</span>
						<span className='text-sm text-gray-500'>
							{Math.round(progress)}% completado
						</span>
					</div>
					<Progress value={progress} className='h-2' />
				</div>
			</div>
			<div className='flex justify-between items-center gap-4 sm:gap-8'>
				<Button
					variant='outline'
					onClick={prevStep}
					disabled={isFirst}
					className='flex items-center space-x-2 flex-shrink-0'
				>
					<ChevronLeft className='w-4 h-4' />
					<span>Anterior</span>
				</Button>
				<div className='flex space-x-3 sm:space-x-6 flex-1 justify-center'>
					{steps.map((step, index) => {
						const clickable =
							index < stepNumber || canProceed(index);
						return (
							<div
								key={step.id}
								className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition
									${
										index === stepNumber
											? 'bg-blue-100 text-blue-700 border border-blue-200'
											: index < stepNumber
											? 'bg-green-100 text-green-700 cursor-pointer'
											: canProceed(index)
											? 'bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer'
											: 'bg-gray-50 text-gray-400'
									}`}
								onClick={() => clickable && goToStep(step.id)}
								style={{
									pointerEvents: clickable ? 'auto' : 'none',
								}}
							>
								<div
									className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
										index === stepNumber
											? 'bg-blue-500 text-white'
											: step.completed
											? 'bg-green-500 text-white'
											: 'bg-gray-300 text-gray-600'
									}`}
								>
									{step.completed ? '✓' : index + 1}
								</div>
								<span className='text-sm font-medium hidden sm:inline'>
									{step.name}
								</span>
							</div>
						);
					})}
				</div>
				<Button
					onClick={nextStep}
					disabled={isLast || !canProceed(stepNumber + 1)}
					className='flex items-center space-x-2 flex-shrink-0'
				>
					<span>{isLast ? 'Finalizar' : 'Siguiente'}</span>
					<ChevronRight className='w-4 h-4' />
				</Button>
			</div>
		</div>
	);
}

function QuotingLayoutContent({ children }: { children: React.ReactNode }) {
	return (
		<div className='bg-gray-50'>
			<QuotingHeader />
			<main className='max-w-4xl mx-auto px-4 py-8'>{children}</main>
		</div>
	);
}

export default function QuotingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<QuotingProvider>
			<QuotingLayoutContent>{children}</QuotingLayoutContent>
		</QuotingProvider>
	);
}
