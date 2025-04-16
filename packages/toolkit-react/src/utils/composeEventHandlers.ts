type PossibleEventHandler<TSyntheticEvent extends React.SyntheticEvent> =
	| React.EventHandler<TSyntheticEvent>
	| undefined;

export const composeEventHandlers = <TSyntheticEvent extends React.SyntheticEvent>(
	eventHandlers: Array<PossibleEventHandler<TSyntheticEvent>>
): React.EventHandler<TSyntheticEvent> => {
	// prettier-ignore
	const mergedEventHandler: React.EventHandler<TSyntheticEvent> = (event) => eventHandlers.forEach((handler) => handler?.(event));

	return mergedEventHandler;
};
