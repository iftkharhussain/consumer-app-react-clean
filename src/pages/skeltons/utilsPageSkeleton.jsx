import { Skeleton, Flex, Card, Row, Col } from 'antd';

const UtilsPageSkeleton = () => {
	return (
		<>
			<Skeleton.Input
				active
				style={{ width: 820, height: 32, marginBottom: 40 }}
			/>

			<Row gutter={[16, 16]}>
				<Col span={3}>
					<Skeleton.Input
						active
						style={{ width: 80, height: 22, marginBottom: 30 }}
					/>
					<br />
					<Skeleton.Input
						active
						style={{ width: 80, height: 22, marginBottom: 30 }}
					/>
					<br />
					<Skeleton.Input
						active
						style={{ width: 80, height: 22, marginBottom: 30 }}
					/>
					<br />
				</Col>
				<Col span={21}>
					<Row>
						<Col span={12}>
							<Card>
								<Skeleton active title={false} paragraph={{ rows: 5 }} />
							</Card>
						</Col>
						<Col span={12}>
							<Card style={{ marginLeft: 15 }}>
								<Skeleton active title={false} paragraph={{ rows: 5 }} />
							</Card>
						</Col>
					</Row>
				</Col>
			</Row>
			<Flex style={{ marginBottom: 20, marginTop: 20 }} justify={'flex-end'}>
				<Skeleton.Button
					active
					style={{ width: 144, height: 32, marginBottom: 20 }}
				/>
			</Flex>
		</>
	);
};

export default UtilsPageSkeleton;
