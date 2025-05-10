import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// OnlyPens
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const onlyPensAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'packageId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'deliverableId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'writer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'DeliverableApproved',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'packageId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'deliverableId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'contentType',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DeliverableCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'packageId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'deliverableId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'writer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'DeliverableRejected',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'packageId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'deliverableId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'writer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'DeliverableRevised',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'packageId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'deliverableId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'writer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'DeliverableSubmitted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'packageId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'ghostwriter',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'GhostwriterInvited',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'packageId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'GigPackageCancelled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'packageId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'GigPackageCompleted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'packageId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'creator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'expiresAt',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'GigPackageCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'packageId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'GigPackageExpired',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'packageId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'ghostwriter',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'InvitationAccepted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'packageId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'ghostwriter',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'InvitationDeclined',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'packageId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'deliverableId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'platformFee',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'PaymentReleased',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newFeeBps',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
    ],
    name: 'PlatformFeeUpdated',
  },
  {
    type: 'function',
    inputs: [],
    name: 'RELEASE_TIMEOUT',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_packageId', internalType: 'uint256', type: 'uint256' }],
    name: 'acceptInvitation',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_packageId', internalType: 'uint256', type: 'uint256' }],
    name: 'approveAllDeliverables',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_packageId', internalType: 'uint256', type: 'uint256' },
      { name: '_deliverableId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approveDeliverable',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_packageId', internalType: 'uint256', type: 'uint256' }],
    name: 'cancelExpiredPackage',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_packageId', internalType: 'uint256', type: 'uint256' }],
    name: 'cancelGigPackage',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_totalAmount', internalType: 'uint256', type: 'uint256' },
      {
        name: '_deliverables',
        internalType: 'struct DeliverableInput[]',
        type: 'tuple[]',
        components: [
          { name: 'contentType', internalType: 'string', type: 'string' },
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: '_expiresAt', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'createGigPackage',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_packageId', internalType: 'uint256', type: 'uint256' }],
    name: 'declineInvitation',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'deliverableIndexInPackage',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_packageId', internalType: 'uint256', type: 'uint256' }],
    name: 'getActiveInvitees',
    outputs: [{ name: '', internalType: 'address[]', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_packageId', internalType: 'uint256', type: 'uint256' }],
    name: 'getPackageDeliverables',
    outputs: [{ name: '', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_packageId', internalType: 'uint256', type: 'uint256' }],
    name: 'getPackageDetails',
    outputs: [
      { name: 'creator', internalType: 'address', type: 'address' },
      { name: 'writer', internalType: 'address', type: 'address' },
      { name: 'totalAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'createdAt', internalType: 'uint256', type: 'uint256' },
      { name: 'lastUpdated', internalType: 'uint256', type: 'uint256' },
      { name: 'expiresAt', internalType: 'uint256', type: 'uint256' },
      {
        name: 'status',
        internalType: 'enum OnlyPens.PackageStatus',
        type: 'uint8',
      },
      { name: 'numDeliverables', internalType: 'uint256', type: 'uint256' },
      { name: 'numApproved', internalType: 'uint256', type: 'uint256' },
      { name: 'amountReleased', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_user', internalType: 'address', type: 'address' },
      { name: '_offset', internalType: 'uint256', type: 'uint256' },
      { name: '_limit', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getUserPackageDetails',
    outputs: [
      { name: 'packageIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'total', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_user', internalType: 'address', type: 'address' }],
    name: 'getUserPackages',
    outputs: [{ name: '', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_usdc', internalType: 'contract IERC20', type: 'address' },
      { name: '_treasury', internalType: 'address', type: 'address' },
      { name: '_platformFeeBps', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_packageId', internalType: 'uint256', type: 'uint256' },
      { name: '_ghostwriter', internalType: 'address', type: 'address' },
    ],
    name: 'inviteGhostwriter',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'address', type: 'address' },
    ],
    name: 'isInvited',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_packageId', internalType: 'uint256', type: 'uint256' }],
    name: 'isPackageExpired',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'nextDeliverableId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'nextPackageId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'packageDeliverableIds',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'packageDeliverables',
    outputs: [
      { name: 'id', internalType: 'uint256', type: 'uint256' },
      { name: 'contentType', internalType: 'string', type: 'string' },
      {
        name: 'status',
        internalType: 'enum OnlyPens.DeliverableStatus',
        type: 'uint8',
      },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'submittedAt', internalType: 'uint256', type: 'uint256' },
      { name: 'approvedAt', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'packageExists',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'packageInvitees',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'packages',
    outputs: [
      { name: 'packageId', internalType: 'uint256', type: 'uint256' },
      { name: 'creator', internalType: 'address', type: 'address' },
      { name: 'writer', internalType: 'address', type: 'address' },
      { name: 'totalAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'createdAt', internalType: 'uint256', type: 'uint256' },
      { name: 'lastUpdated', internalType: 'uint256', type: 'uint256' },
      { name: 'expiresAt', internalType: 'uint256', type: 'uint256' },
      {
        name: 'status',
        internalType: 'enum OnlyPens.PackageStatus',
        type: 'uint8',
      },
      { name: 'numDeliverables', internalType: 'uint256', type: 'uint256' },
      { name: 'numApproved', internalType: 'uint256', type: 'uint256' },
      { name: 'amountReleased', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'platformFeeBps',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_tokenAddress', internalType: 'address', type: 'address' },
      { name: '_amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'recoverERC20',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_packageId', internalType: 'uint256', type: 'uint256' },
      { name: '_deliverableId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'rejectDeliverable',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_newFeeBps', internalType: 'uint16', type: 'uint16' }],
    name: 'setPlatformFee',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_packageId', internalType: 'uint256', type: 'uint256' },
      { name: '_deliverableId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'submitDeliverable',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'treasury',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'usdc',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'userPackages',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__
 */
export const useReadOnlyPens = /*#__PURE__*/ createUseReadContract({
  abi: onlyPensAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"RELEASE_TIMEOUT"`
 */
export const useReadOnlyPensReleaseTimeout =
  /*#__PURE__*/ createUseReadContract({
    abi: onlyPensAbi,
    functionName: 'RELEASE_TIMEOUT',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"deliverableIndexInPackage"`
 */
export const useReadOnlyPensDeliverableIndexInPackage =
  /*#__PURE__*/ createUseReadContract({
    abi: onlyPensAbi,
    functionName: 'deliverableIndexInPackage',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"getActiveInvitees"`
 */
export const useReadOnlyPensGetActiveInvitees =
  /*#__PURE__*/ createUseReadContract({
    abi: onlyPensAbi,
    functionName: 'getActiveInvitees',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"getPackageDeliverables"`
 */
export const useReadOnlyPensGetPackageDeliverables =
  /*#__PURE__*/ createUseReadContract({
    abi: onlyPensAbi,
    functionName: 'getPackageDeliverables',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"getPackageDetails"`
 */
export const useReadOnlyPensGetPackageDetails =
  /*#__PURE__*/ createUseReadContract({
    abi: onlyPensAbi,
    functionName: 'getPackageDetails',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"getUserPackageDetails"`
 */
export const useReadOnlyPensGetUserPackageDetails =
  /*#__PURE__*/ createUseReadContract({
    abi: onlyPensAbi,
    functionName: 'getUserPackageDetails',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"getUserPackages"`
 */
export const useReadOnlyPensGetUserPackages =
  /*#__PURE__*/ createUseReadContract({
    abi: onlyPensAbi,
    functionName: 'getUserPackages',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"isInvited"`
 */
export const useReadOnlyPensIsInvited = /*#__PURE__*/ createUseReadContract({
  abi: onlyPensAbi,
  functionName: 'isInvited',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"isPackageExpired"`
 */
export const useReadOnlyPensIsPackageExpired =
  /*#__PURE__*/ createUseReadContract({
    abi: onlyPensAbi,
    functionName: 'isPackageExpired',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"nextDeliverableId"`
 */
export const useReadOnlyPensNextDeliverableId =
  /*#__PURE__*/ createUseReadContract({
    abi: onlyPensAbi,
    functionName: 'nextDeliverableId',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"nextPackageId"`
 */
export const useReadOnlyPensNextPackageId = /*#__PURE__*/ createUseReadContract(
  { abi: onlyPensAbi, functionName: 'nextPackageId' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"owner"`
 */
export const useReadOnlyPensOwner = /*#__PURE__*/ createUseReadContract({
  abi: onlyPensAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"packageDeliverableIds"`
 */
export const useReadOnlyPensPackageDeliverableIds =
  /*#__PURE__*/ createUseReadContract({
    abi: onlyPensAbi,
    functionName: 'packageDeliverableIds',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"packageDeliverables"`
 */
export const useReadOnlyPensPackageDeliverables =
  /*#__PURE__*/ createUseReadContract({
    abi: onlyPensAbi,
    functionName: 'packageDeliverables',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"packageExists"`
 */
export const useReadOnlyPensPackageExists = /*#__PURE__*/ createUseReadContract(
  { abi: onlyPensAbi, functionName: 'packageExists' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"packageInvitees"`
 */
export const useReadOnlyPensPackageInvitees =
  /*#__PURE__*/ createUseReadContract({
    abi: onlyPensAbi,
    functionName: 'packageInvitees',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"packages"`
 */
export const useReadOnlyPensPackages = /*#__PURE__*/ createUseReadContract({
  abi: onlyPensAbi,
  functionName: 'packages',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"platformFeeBps"`
 */
export const useReadOnlyPensPlatformFeeBps =
  /*#__PURE__*/ createUseReadContract({
    abi: onlyPensAbi,
    functionName: 'platformFeeBps',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"treasury"`
 */
export const useReadOnlyPensTreasury = /*#__PURE__*/ createUseReadContract({
  abi: onlyPensAbi,
  functionName: 'treasury',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"usdc"`
 */
export const useReadOnlyPensUsdc = /*#__PURE__*/ createUseReadContract({
  abi: onlyPensAbi,
  functionName: 'usdc',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"userPackages"`
 */
export const useReadOnlyPensUserPackages = /*#__PURE__*/ createUseReadContract({
  abi: onlyPensAbi,
  functionName: 'userPackages',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link onlyPensAbi}__
 */
export const useWriteOnlyPens = /*#__PURE__*/ createUseWriteContract({
  abi: onlyPensAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"acceptInvitation"`
 */
export const useWriteOnlyPensAcceptInvitation =
  /*#__PURE__*/ createUseWriteContract({
    abi: onlyPensAbi,
    functionName: 'acceptInvitation',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"approveAllDeliverables"`
 */
export const useWriteOnlyPensApproveAllDeliverables =
  /*#__PURE__*/ createUseWriteContract({
    abi: onlyPensAbi,
    functionName: 'approveAllDeliverables',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"approveDeliverable"`
 */
export const useWriteOnlyPensApproveDeliverable =
  /*#__PURE__*/ createUseWriteContract({
    abi: onlyPensAbi,
    functionName: 'approveDeliverable',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"cancelExpiredPackage"`
 */
export const useWriteOnlyPensCancelExpiredPackage =
  /*#__PURE__*/ createUseWriteContract({
    abi: onlyPensAbi,
    functionName: 'cancelExpiredPackage',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"cancelGigPackage"`
 */
export const useWriteOnlyPensCancelGigPackage =
  /*#__PURE__*/ createUseWriteContract({
    abi: onlyPensAbi,
    functionName: 'cancelGigPackage',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"createGigPackage"`
 */
export const useWriteOnlyPensCreateGigPackage =
  /*#__PURE__*/ createUseWriteContract({
    abi: onlyPensAbi,
    functionName: 'createGigPackage',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"declineInvitation"`
 */
export const useWriteOnlyPensDeclineInvitation =
  /*#__PURE__*/ createUseWriteContract({
    abi: onlyPensAbi,
    functionName: 'declineInvitation',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteOnlyPensInitialize = /*#__PURE__*/ createUseWriteContract({
  abi: onlyPensAbi,
  functionName: 'initialize',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"inviteGhostwriter"`
 */
export const useWriteOnlyPensInviteGhostwriter =
  /*#__PURE__*/ createUseWriteContract({
    abi: onlyPensAbi,
    functionName: 'inviteGhostwriter',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"recoverERC20"`
 */
export const useWriteOnlyPensRecoverErc20 =
  /*#__PURE__*/ createUseWriteContract({
    abi: onlyPensAbi,
    functionName: 'recoverERC20',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"rejectDeliverable"`
 */
export const useWriteOnlyPensRejectDeliverable =
  /*#__PURE__*/ createUseWriteContract({
    abi: onlyPensAbi,
    functionName: 'rejectDeliverable',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteOnlyPensRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: onlyPensAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"setPlatformFee"`
 */
export const useWriteOnlyPensSetPlatformFee =
  /*#__PURE__*/ createUseWriteContract({
    abi: onlyPensAbi,
    functionName: 'setPlatformFee',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"submitDeliverable"`
 */
export const useWriteOnlyPensSubmitDeliverable =
  /*#__PURE__*/ createUseWriteContract({
    abi: onlyPensAbi,
    functionName: 'submitDeliverable',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteOnlyPensTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: onlyPensAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link onlyPensAbi}__
 */
export const useSimulateOnlyPens = /*#__PURE__*/ createUseSimulateContract({
  abi: onlyPensAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"acceptInvitation"`
 */
export const useSimulateOnlyPensAcceptInvitation =
  /*#__PURE__*/ createUseSimulateContract({
    abi: onlyPensAbi,
    functionName: 'acceptInvitation',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"approveAllDeliverables"`
 */
export const useSimulateOnlyPensApproveAllDeliverables =
  /*#__PURE__*/ createUseSimulateContract({
    abi: onlyPensAbi,
    functionName: 'approveAllDeliverables',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"approveDeliverable"`
 */
export const useSimulateOnlyPensApproveDeliverable =
  /*#__PURE__*/ createUseSimulateContract({
    abi: onlyPensAbi,
    functionName: 'approveDeliverable',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"cancelExpiredPackage"`
 */
export const useSimulateOnlyPensCancelExpiredPackage =
  /*#__PURE__*/ createUseSimulateContract({
    abi: onlyPensAbi,
    functionName: 'cancelExpiredPackage',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"cancelGigPackage"`
 */
export const useSimulateOnlyPensCancelGigPackage =
  /*#__PURE__*/ createUseSimulateContract({
    abi: onlyPensAbi,
    functionName: 'cancelGigPackage',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"createGigPackage"`
 */
export const useSimulateOnlyPensCreateGigPackage =
  /*#__PURE__*/ createUseSimulateContract({
    abi: onlyPensAbi,
    functionName: 'createGigPackage',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"declineInvitation"`
 */
export const useSimulateOnlyPensDeclineInvitation =
  /*#__PURE__*/ createUseSimulateContract({
    abi: onlyPensAbi,
    functionName: 'declineInvitation',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateOnlyPensInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: onlyPensAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"inviteGhostwriter"`
 */
export const useSimulateOnlyPensInviteGhostwriter =
  /*#__PURE__*/ createUseSimulateContract({
    abi: onlyPensAbi,
    functionName: 'inviteGhostwriter',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"recoverERC20"`
 */
export const useSimulateOnlyPensRecoverErc20 =
  /*#__PURE__*/ createUseSimulateContract({
    abi: onlyPensAbi,
    functionName: 'recoverERC20',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"rejectDeliverable"`
 */
export const useSimulateOnlyPensRejectDeliverable =
  /*#__PURE__*/ createUseSimulateContract({
    abi: onlyPensAbi,
    functionName: 'rejectDeliverable',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateOnlyPensRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: onlyPensAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"setPlatformFee"`
 */
export const useSimulateOnlyPensSetPlatformFee =
  /*#__PURE__*/ createUseSimulateContract({
    abi: onlyPensAbi,
    functionName: 'setPlatformFee',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"submitDeliverable"`
 */
export const useSimulateOnlyPensSubmitDeliverable =
  /*#__PURE__*/ createUseSimulateContract({
    abi: onlyPensAbi,
    functionName: 'submitDeliverable',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateOnlyPensTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: onlyPensAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link onlyPensAbi}__
 */
export const useWatchOnlyPensEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: onlyPensAbi,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link onlyPensAbi}__ and `eventName` set to `"DeliverableApproved"`
 */
export const useWatchOnlyPensDeliverableApprovedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: onlyPensAbi,
    eventName: 'DeliverableApproved',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link onlyPensAbi}__ and `eventName` set to `"DeliverableCreated"`
 */
export const useWatchOnlyPensDeliverableCreatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: onlyPensAbi,
    eventName: 'DeliverableCreated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link onlyPensAbi}__ and `eventName` set to `"DeliverableRejected"`
 */
export const useWatchOnlyPensDeliverableRejectedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: onlyPensAbi,
    eventName: 'DeliverableRejected',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link onlyPensAbi}__ and `eventName` set to `"DeliverableRevised"`
 */
export const useWatchOnlyPensDeliverableRevisedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: onlyPensAbi,
    eventName: 'DeliverableRevised',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link onlyPensAbi}__ and `eventName` set to `"DeliverableSubmitted"`
 */
export const useWatchOnlyPensDeliverableSubmittedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: onlyPensAbi,
    eventName: 'DeliverableSubmitted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link onlyPensAbi}__ and `eventName` set to `"GhostwriterInvited"`
 */
export const useWatchOnlyPensGhostwriterInvitedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: onlyPensAbi,
    eventName: 'GhostwriterInvited',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link onlyPensAbi}__ and `eventName` set to `"GigPackageCancelled"`
 */
export const useWatchOnlyPensGigPackageCancelledEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: onlyPensAbi,
    eventName: 'GigPackageCancelled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link onlyPensAbi}__ and `eventName` set to `"GigPackageCompleted"`
 */
export const useWatchOnlyPensGigPackageCompletedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: onlyPensAbi,
    eventName: 'GigPackageCompleted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link onlyPensAbi}__ and `eventName` set to `"GigPackageCreated"`
 */
export const useWatchOnlyPensGigPackageCreatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: onlyPensAbi,
    eventName: 'GigPackageCreated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link onlyPensAbi}__ and `eventName` set to `"GigPackageExpired"`
 */
export const useWatchOnlyPensGigPackageExpiredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: onlyPensAbi,
    eventName: 'GigPackageExpired',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link onlyPensAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchOnlyPensInitializedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: onlyPensAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link onlyPensAbi}__ and `eventName` set to `"InvitationAccepted"`
 */
export const useWatchOnlyPensInvitationAcceptedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: onlyPensAbi,
    eventName: 'InvitationAccepted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link onlyPensAbi}__ and `eventName` set to `"InvitationDeclined"`
 */
export const useWatchOnlyPensInvitationDeclinedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: onlyPensAbi,
    eventName: 'InvitationDeclined',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link onlyPensAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchOnlyPensOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: onlyPensAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link onlyPensAbi}__ and `eventName` set to `"PaymentReleased"`
 */
export const useWatchOnlyPensPaymentReleasedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: onlyPensAbi,
    eventName: 'PaymentReleased',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link onlyPensAbi}__ and `eventName` set to `"PlatformFeeUpdated"`
 */
export const useWatchOnlyPensPlatformFeeUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: onlyPensAbi,
    eventName: 'PlatformFeeUpdated',
  })
