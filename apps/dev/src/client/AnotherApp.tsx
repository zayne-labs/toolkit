import { css } from "@zayne-labs/toolkit-core";
import {
	type GetSlotComponentProps,
	createSlotComponent,
	getMultipleSlots,
	getSlotMap,
} from "@zayne-labs/toolkit-react/utils";

const scopedCss = css`
	@scope {
		button {
			background-color: red;
			margin-top: 10px;
		}

		.wrapper-section {
			display: flex;
			flex-direction: column;
			gap: 50px;
		}
	}
`;

function AnotherApp() {
	return (
		<main>
			<style>{scopedCss}</style>

			<section className="wrapper-section">
				<ParentOne>
					<ParentOne.Slot name="header">ParentOne Header</ParentOne.Slot>

					<ParentOne.Slot name="content">ParentOne Content</ParentOne.Slot>

					<ParentOne.Slot name="footer">ParentOne Footer</ParentOne.Slot>

					<p>This is a default Slot under Parent One</p>
				</ParentOne>

				<ParentTwo>
					<ParentTwo.Header>ParentTwo Header</ParentTwo.Header>

					<ParentTwo.Content>ParentTwo Content</ParentTwo.Content>

					<ParentTwo.Footer>ParentTwo Footer</ParentTwo.Footer>

					<p>This is a default Slot under Parent Two</p>
				</ParentTwo>
			</section>

			<button type="button">Click me</button>
		</main>
	);
}

type SlotComponentProps =
	| GetSlotComponentProps<"content">
	| GetSlotComponentProps<"footer">
	| GetSlotComponentProps<"header">;

function ParentOne(props: { children: React.ReactNode }) {
	const { children } = props;

	const slots = getSlotMap<SlotComponentProps>(children);

	return (
		<section>
			<header>{slots.header}</header>
			<p>{slots.content}</p>
			<footer>{slots.footer}</footer>

			<aside id="default-slots">{slots.default}</aside>
		</section>
	);
}

ParentOne.Slot = createSlotComponent<SlotComponentProps>();

function ParentTwo(props: { children: React.ReactNode }) {
	const { children } = props;

	const {
		regularChildren,
		slots: [headerSlot, contentSlot, footerSlot],
	} = getMultipleSlots(children, [ParentTwoHeader, ParentTwoContent, ParentTwoFooter]);

	return (
		<section>
			<header>{headerSlot}</header>
			<p>{contentSlot}</p>
			<footer>{footerSlot}</footer>

			<aside id="default-slots">{regularChildren}</aside>
		</section>
	);
}

ParentTwo.Header = ParentTwoHeader;
ParentTwo.Content = ParentTwoContent;
ParentTwo.Footer = ParentTwoFooter;

function ParentTwoHeader(props: { children: React.ReactNode }) {
	const { children } = props;

	return <em>{children}</em>;
}
ParentTwoHeader.slotSymbol = Symbol("header");

function ParentTwoContent(props: { children: React.ReactNode }) {
	const { children } = props;

	return <em>{children}</em>;
}
ParentTwoContent.slotSymbol = Symbol("content");

function ParentTwoFooter(props: { children: React.ReactNode }) {
	const { children } = props;

	return <em>{children}</em>;
}
ParentTwoFooter.slotSymbol = Symbol("footer");

export default AnotherApp;
