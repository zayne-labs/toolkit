type PossibleEventHandler<TEvent extends React.SyntheticEvent> = React.EventHandler<TEvent> | undefined;

export const composeEventHandlers = <TEvent extends React.SyntheticEvent>(
	eventHandlers: Array<PossibleEventHandler<TEvent>>
): React.EventHandler<TEvent> => {
	// prettier-ignore
	const mergedEventHandler: React.EventHandler<TEvent> = (event) => eventHandlers.forEach((handler) => handler?.(event));

	return mergedEventHandler;
};
