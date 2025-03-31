import {
	type GetSlotComponentProps,
	createSlotComponent,
	getSlotMap,
} from "@zayne-labs/toolkit/react/utils";

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

						header {
							position: sticky;
							top: 0;
							height: 100px;
							background-color: blue;
							width: 100%;
							margin-bottom: 10000px;
						}
					}
				`}
			</style>

			<Section>
				<Slot name="header">
					<p>Header</p>
				</Slot>
				<Slot name="content">
					<p>Content</p>
				</Slot>
				<Slot name="footer">
					<p>Footer</p>
				</Slot>
				Random Text
			</Section>

			<button className="btn" type="button">
				Force Render
			</button>
		</div>
	);
}

type SlotComponentProps =
	| GetSlotComponentProps<"content">
	| GetSlotComponentProps<"footer">
	| GetSlotComponentProps<"header">;

const Slot = createSlotComponent<SlotComponentProps>();

function Section(props: { children: React.ReactNode }) {
	const { children } = props;

	const slots = getSlotMap<SlotComponentProps>(children);

	console.info({ slots });

	return <section>{slots.default}</section>;
}

export default AnotherApp;
