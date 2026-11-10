import FormattedDate from '../FormattedDate.astro';

const meta = {
	title: 'Components/FormattedDate',
	component: FormattedDate,
};

export default meta;

export const Default = {
	args: { date: new Date('2026-11-07T12:00:00Z') },
};

export const PreviousYear = {
	args: { date: new Date('2025-06-15T12:00:00Z') },
};
