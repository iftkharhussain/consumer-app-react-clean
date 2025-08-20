import { Skeleton, Flex, Card, Row, Col } from 'antd';

const SecuritySkeleton = () => {
	return (
		<>
			<Skeleton.Input
				active
				style={{ width: 820, height: 32, marginBottom: 40 }}
			/>
			<br />
			<Skeleton.Input
				active
				style={{ width: 150, height: 32, marginBottom: 20 }}
			/>
			<br />
			<Row gutter={[16, 16]}>
				<Col span={12}>
					<Card>
						<Skeleton active title={false} paragraph={{ rows: 8 }} />
					</Card>
				</Col>
			</Row>
			<Skeleton.Input
				active
				style={{ width: 150, height: 32, marginBottom: 20, marginTop: 20 }}
			/>
			<br />
			<Row gutter={[16, 16]}>
				<Col span={12}>
					<Card>
						<Skeleton active title={false} paragraph={{ rows: 5 }} />
					</Card>
				</Col>
			</Row>
		</>
	);
};
export default SecuritySkeleton;
