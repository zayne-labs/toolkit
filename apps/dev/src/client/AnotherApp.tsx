import {
	type GetSlotComponentProps,
	createSlotComponent,
	getSingleSlot,
	getSlotMap,
} from "@zayne-labs/toolkit-react/utils";

function AnotherApp() {
	return (
		<div>
			<style>
				{`
					@scope {
						button {
							background-color: red;
							margin-top: 10px;
						}
					}
				`}
			</style>

			<Parent>
				{/* eslint-disable-next-line react/no-useless-fragment -- Allow */}
				<>Hello</>

				<Parent.Slot name="header">
					<header>Header</header>
				</Parent.Slot>

				<Parent.Slot name="content">
					<p>Content</p>
				</Parent.Slot>

				<Parent.Slot name="footer">
					<footer>Footer</footer>
				</Parent.Slot>
			</Parent>

			<ParentTwo>
				<ParentTwo.Header>
					<header>Header</header>
				</ParentTwo.Header>
			</ParentTwo>

			<button className="btn" type="button">
				Click me
			</button>
		</div>
	);
}

type SlotComponentProps =
	| GetSlotComponentProps<"content">
	| GetSlotComponentProps<"footer">
	| GetSlotComponentProps<"header">;

function Parent(props: { children: React.ReactNode }) {
	const { children } = props;

	const slots = getSlotMap<SlotComponentProps>(children);

	console.info({ slots });

	return <section>{slots.default}</section>;
}

Parent.Slot = createSlotComponent<SlotComponentProps>();

function ParentTwo(props: { children: React.ReactNode }) {
	const { children } = props;

	const headerSlot = getSingleSlot(children, ParentTwo.Header);

	return <section>{headerSlot}</section>;
}

function ParentHeader(props: { children: React.ReactNode }) {
	const { children } = props;

	const headerSlot = getSingleSlot(children, ParentHeader);

	return <header>{headerSlot}</header>;
}

ParentHeader.slotSymbol = Symbol("header");

ParentTwo.Header = ParentHeader;

export default AnotherApp;
