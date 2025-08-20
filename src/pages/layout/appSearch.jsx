import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { appSearchUrl } from '../../apis/sharedApi';
import { Types, setRequest, action } from '../../utils/helper';
import { Skeleton, Select, Typography, Empty, Tag } from 'antd';
import { NotificationMessage } from '../../components/index';

const { Title } = Typography;
const { Option } = Select;

const loadingSkelton = [
	{ value: 'test', text: 'loading' },
	{ value: 'test', text: 'loading' },
	{ value: 'test', text: 'loading' },
	{ value: 'test', text: 'loading' },
];

const AppSearch = (props) => {
	const { t } = useTranslation();
	const dispatch = useDispatch();
	const [data, setData] = useState([]);
	const [value, setValue] = useState();
	const [loading, setLoading] = useState(false);
	const [searchType, setSearchType] = useState('');
	const [searchFocus, setSearchFocus] = useState(false);

	let searchTimer;
	const handleSearch = (newValue) => {
		// Clear any existing timer first
		clearTimeout(searchTimer);
		
		 // Clear results immediately for short inputs
		if (newValue?.length <= 3) {
			setData([]);
			setLoading(false);
			return;
		}
		
		// Set a timer to delay the search until typing stops
		searchTimer = setTimeout(() => {
			if (newValue?.length > 3) {
				callSearchData(newValue, setData);
			}
		}, 1000); // Wait 1 second after typing stops
	};

	const callSearchData = async (value, callback, type) => {
		// Set loading to true right before the request is made
		setLoading(true);
		setValue(value);
		callback(loadingSkelton);
		const formData = new URLSearchParams();
		formData.append('q', value);
		formData.append('type', 'leads');
		if (type === 'fetchRecent') {
			formData.append('fetchType', 'recent');
		}
		setSearchFocus(true);
		const searchRes = await setRequest( Types.APP_SEARCH, formData, appSearchUrl, Types.GET, dispatch, );
		if (searchRes?.success) {
			if (type === 'fetchRecent') {
				setSearchType('recent');
			} else {
				setSearchType('');
			}
			callback(searchRes?.data);
		} else {
			toast.error(t(searchRes?.message) || 'In app search, something goes wrong');
		}
		setLoading(false);
	};

	return (
		<div
			className={
				searchFocus ? 'bg-shadow-wrapper search-wrapper' : 'search-wrapper'
			}>
			<Select
				showSearch
				value={value}
				loading={'false'}
				open={searchFocus}
				style={{ width: '300px' }}
				filterOption={false}
				notFoundContent={null}
				onSearch={handleSearch}
				placeholder={t('SearchConsumerApp')}
				defaultActiveFirstOption={false}
				className='app-search'
				size='large'
				onFocus={() => {
					setSearchFocus(true);
					callSearchData('', setData, 'fetchRecent');
				}}
				suffixIcon={loading ? 'loading...' : null}
				onBlur={() => {
					if (!loading) {
						setData([]);
						setValue(null);
						setSearchFocus(false);
					}
				}}
				dropdownRender={(menu) => (
					<span className='app-search-result-list'>
						<Title style={{ margin: '8px 10px', fontSize: 13.5 }} level={5}>
							{' '}
							{/* {searchType === 'recent'
								? `Recent ${loading ? 'query Searching...' : 'Search:'}`
								: `${loading ? 'Searching data...' : 'Search data:'}`} */}
							{searchType === 'recent'
								? `${t('recent')} ${
										loading ? t('querySearching') : t('search')
								  }:`
								: `${loading ? t('searchingData') : t('searchData')}:`}
						</Title>
						{menu}
						{data?.length > 0 && (
							<span>
								{!loading && (
									<span>
										{data?.[0].text !== 'loading' && (
											<span className='app-search-result-info'>
												{' '}
												<NotificationMessage
													text={`We've found ${data?.length} Leads`}
												/>{' '}
											</span>
										)}
									</span>
								)}
							</span>
						)}
					</span>
				)}>
				{!loading && searchFocus && data?.length === 0 && (
					<Option disabled={true}>
						<Empty
							description={t('NoResultFound')}
							image={Empty.PRESENTED_IMAGE_SIMPLE}
						/>
					</Option>
				)}
				{loading && searchFocus && (
					<div className='search-option-wrapper'>
						<Skeleton active />
					</div>
				)}
				{!loading &&
					data?.map((d, i) => (
						<Option key={i} disabled={d?.text === 'loading'}>
							{d?.text === 'loading' ? (
								<div style={{ display: 'flex', flexDirection: 'column' }}>
									<Skeleton.Button
										style={{
											height: 18,
											width: 100,
											marginTop: 5,
											marginBottom: 5,
										}}
										active={true}
										size={'small'}
										shape={'buttonShape'}
									/>
									<Skeleton.Input
										style={{ height: 18 }}
										active={true}
										size={'small'}
										block={true}
									/>
								</div>
							) : (
								<Link onClick={e => dispatch(action(Types.LEAD_DRAWER_ID, d?._id))} key={i}>
									<div className='search-option-wrapper'>
										{/* <div className="search-option-media"></div> */}
										<div className='search-option-content'>
											<div className='search-option-header'>
												<Title style={{ margin: 0, fontSize: 13.5 }} level={5}>
													{d?.nameOfTheLead}
												</Title>
											</div>
											{/* <div className='search-option-desc'>
												<div className='search-option-lead-price'>
													{d?.leadValue?.value}
												</div>
												<div className='search-option-lead-source'>
													<Tag style={{ marginBottom: 5 }} bordered={true} color='blue'> {d?.product?.title} </Tag>
												</div>
											</div> */}
										</div>
									</div>
								</Link>
							)}
						</Option>
					))}
			</Select>
			<div className='bg-shadow'></div>
		</div>
	);
};

export default AppSearch;
