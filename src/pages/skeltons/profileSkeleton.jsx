import { Skeleton, Flex, Row, Col } from 'antd';

const ProfileSkeleton = () => {
	return (
		<>
			<Skeleton.Input
				active
				style={{ width: 150, height: 32, marginBottom: 20 }}
			/>
			<br />
			<Skeleton.Input active style={{ width: 820, height: 32 }} />
			<div>
				<Row gutter={[16, 16]}>
					<Col span={24}>
						<Row style={{ marginTop: 50 }}>
							<Col span={4}>
								<Skeleton.Input active style={{ width: 130, height: 130 }} />
							</Col>
							<Col span={7} style={{ textAlign: 'right' }}>
								<Skeleton.Input
									active
									style={{ width: 380, height: 30, marginBottom: 20 }}
								/>
								<Skeleton.Input
									active
									style={{ width: 380, height: 30, marginBottom: 20 }}
								/>
								<Skeleton.Input active style={{ width: 380, height: 30 }} />
							</Col>
							<Col span={7} style={{ textAlign: 'right' }}>
								<Skeleton.Input
									active
									style={{ width: 380, height: 30, marginBottom: 20 }}
								/>
								<Skeleton.Input
									active
									style={{ width: 380, height: 30, marginBottom: 20 }}
								/>
								<Skeleton.Input active style={{ width: 380, height: 30 }} />
							</Col>
						</Row>
						<Row>
							<Col span={18}>
								<Flex style={{ marginTop: 20 }} justify={'flex-end'}>
									<Skeleton.Button active style={{ width: 124, height: 32 }} />
								</Flex>
							</Col>
						</Row>
					</Col>
				</Row>
			</div>
		</>
	);
};

export default ProfileSkeleton;
